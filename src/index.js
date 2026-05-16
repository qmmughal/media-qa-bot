"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const asanaClient_1 = require("./clients/asanaClient");
const googleAdsClient_1 = require("./clients/googleAdsClient");
const metaClient_1 = require("./clients/metaClient");
const rulesEngine_1 = require("./engine/rulesEngine");
const database_1 = require("./db/database");
const types_1 = require("./engine/types");
const notifications_1 = require("./utils/notifications");
dotenv.config();
async function main() {
    console.log('🚀 Starting Media QA Bot Reconciliation...');
    const db = await (0, database_1.initDB)();
    // 1. Initialize Clients
    const asanaClient = new asanaClient_1.AsanaClient(process.env.ASANA_ACCESS_TOKEN);
    // Google Ads Client
    const googleClient = new googleAdsClient_1.GoogleAdsClient(process.env.GOOGLE_ADS_DEVELOPER_TOKEN, process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET, process.env.GOOGLE_ADS_REFRESH_TOKEN, process.env.GOOGLE_ADS_CUSTOMER_ID);
    // Meta Client
    const metaClient = new metaClient_1.MetaClient(process.env.META_ACCESS_TOKEN, process.env.META_AD_ACCOUNT_ID);
    try {
        // 2. Fetch Data
        console.log('📥 Fetching data from Asana...');
        const approvedCampaigns = await asanaClient.getApprovedCampaigns(process.env.ASANA_PROJECT_ID);
        console.log('📥 Fetching data from Google Ads...');
        const googleCampaigns = await googleClient.getLiveCampaigns(process.env.GOOGLE_ADS_REFRESH_TOKEN);
        console.log('📥 Fetching data from Meta...');
        const metaCampaigns = await metaClient.getLiveCampaigns();
        const allLiveCampaigns = [...googleCampaigns, ...metaCampaigns];
        // 3. Reconcile
        console.log('🔍 Reconciling campaigns...');
        for (const asanaCamp of approvedCampaigns) {
            // Find matching live campaign by name (simple match for MVP)
            const liveCamp = allLiveCampaigns.find(lc => lc.name.toLowerCase().includes(asanaCamp.name.toLowerCase()) ||
                asanaCamp.name.toLowerCase().includes(lc.name.toLowerCase()));
            if (liveCamp) {
                const exceptions = rulesEngine_1.RulesEngine.validate(asanaCamp, liveCamp);
                if (exceptions.length > 0) {
                    console.log(`❌ Found ${exceptions.length} issues for campaign: ${liveCamp.name}`);
                    for (const ex of exceptions) {
                        // Save to DB
                        await db.run(`
                            INSERT INTO exceptions (campaignId, campaignName, platform, errorType, expectedValue, actualValue, severity)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `, [ex.campaignId, ex.campaignName, ex.platform, ex.errorType, ex.expectedValue, ex.actualValue, ex.severity]);
                        // Post back to Asana
                        const comment = `🚨 QA Bot Alert: [${ex.errorType}] Expected: ${ex.expectedValue}, Actual: ${ex.actualValue}`;
                        await asanaClient.addComment(asanaCamp.id, comment);
                    }
                }
                else {
                    console.log(`✅ Campaign verified: ${liveCamp.name}`);
                }
            }
            else {
                console.warn(`⚠️ Could not find live campaign for Asana task: ${asanaCamp.name}`);
            }
        }
        console.log('✅ Reconciliation complete.');
        // 4. Daily Digest
        const today = new Date().toISOString().split('T')[0];
        const dailyExceptions = await db.all(`SELECT * FROM exceptions WHERE timestamp >= ?`, [today]);
        const report = (0, notifications_1.formatDailyDigest)(dailyExceptions);
        console.log(report);
        if (process.env.TEAMS_WEBHOOK_URL) {
            await (0, notifications_1.sendTeamsNotification)(process.env.TEAMS_WEBHOOK_URL, report);
        }
    }
    catch (error) {
        console.error('❌ Error during reconciliation:', error);
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map