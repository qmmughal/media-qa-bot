import * as dotenv from 'dotenv';
import { AsanaClient } from './clients/asanaClient';
import { GoogleAdsClient } from './clients/googleAdsClient';
import { MetaClient } from './clients/metaClient';
import { RulesEngine } from './engine/rulesEngine';
import { initDB } from './db/database';
import { Platform } from './engine/types';
import { sendTeamsNotification, formatDailyDigest } from './utils/notifications';

dotenv.config();

async function main() {
    console.log('🚀 Starting Media QA Bot Reconciliation...');
    
    const db = await initDB();

    // 1. Initialize Clients
    const asanaClient = new AsanaClient(process.env.ASANA_ACCESS_TOKEN!);
    
    // Google Ads Client
    const googleClient = new GoogleAdsClient(
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        process.env.GOOGLE_ADS_CLIENT_ID!,
        process.env.GOOGLE_ADS_CLIENT_SECRET!,
        process.env.GOOGLE_ADS_REFRESH_TOKEN!,
        process.env.GOOGLE_ADS_CUSTOMER_ID!
    );

    // Meta Client
    const metaClient = new MetaClient(
        process.env.META_ACCESS_TOKEN!,
        process.env.META_AD_ACCOUNT_ID!
    );

    try {
        // 2. Fetch Data
        console.log('📥 Fetching data from Asana...');
        const approvedCampaigns = await asanaClient.getApprovedCampaigns(process.env.ASANA_PROJECT_ID!);
        
        console.log('📥 Fetching data from Google Ads...');
        const googleCampaigns = await googleClient.getLiveCampaigns(process.env.GOOGLE_ADS_REFRESH_TOKEN!);
        
        console.log('📥 Fetching data from Meta...');
        const metaCampaigns = await metaClient.getLiveCampaigns();

        const allLiveCampaigns = [...googleCampaigns, ...metaCampaigns];

        // 3. Reconcile
        console.log('🔍 Reconciling campaigns...');
        for (const asanaCamp of approvedCampaigns) {
            // Find matching live campaign by name (simple match for MVP)
            const liveCamp = allLiveCampaigns.find(lc => 
                lc.name.toLowerCase().includes(asanaCamp.name.toLowerCase()) || 
                asanaCamp.name.toLowerCase().includes(lc.name.toLowerCase())
            );

            if (liveCamp) {
                const exceptions = RulesEngine.validate(asanaCamp, liveCamp);
                
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
                } else {
                    console.log(`✅ Campaign verified: ${liveCamp.name}`);
                }
            } else {
                console.warn(`⚠️ Could not find live campaign for Asana task: ${asanaCamp.name}`);
            }
        }

        console.log('✅ Reconciliation complete.');

        // 4. Daily Digest
        const today = new Date().toISOString().split('T')[0];
        const dailyExceptions = await db.all(`SELECT * FROM exceptions WHERE timestamp >= ?`, [today]);
        
        const report = formatDailyDigest(dailyExceptions);
        console.log(report);

        if (process.env.TEAMS_WEBHOOK_URL) {
            await sendTeamsNotification(process.env.TEAMS_WEBHOOK_URL, report);
        }

    } catch (error) {
        console.error('❌ Error during reconciliation:', error);
    }
}

main().catch(console.error);
