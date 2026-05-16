"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTeamsNotification = sendTeamsNotification;
exports.formatDailyDigest = formatDailyDigest;
const axios_1 = __importDefault(require("axios"));
async function sendTeamsNotification(webhookUrl, message) {
    if (!webhookUrl)
        return;
    try {
        await axios_1.default.post(webhookUrl, {
            text: message
        });
        console.log('📢 Teams notification sent.');
    }
    catch (error) {
        console.error('❌ Failed to send Teams notification:', error);
    }
}
function formatDailyDigest(exceptions) {
    if (exceptions.length === 0) {
        return "✅ Media QA Bot: No issues found today.";
    }
    let report = `🚨 **Media QA Bot Daily Digest**\n\nFound ${exceptions.length} exceptions across campaigns:\n\n`;
    exceptions.forEach(ex => {
        report += `- **${ex.campaignName}** (${ex.platform}): ${ex.errorType} (Exp: ${ex.expectedValue}, Act: ${ex.actualValue})\n`;
    });
    return report;
}
//# sourceMappingURL=notifications.js.map