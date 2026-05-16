import axios from 'axios';

export async function sendTeamsNotification(webhookUrl: string, message: string) {
    if (!webhookUrl) return;
    
    try {
        await axios.post(webhookUrl, {
            text: message
        });
        console.log('📢 Teams notification sent.');
    } catch (error) {
        console.error('❌ Failed to send Teams notification:', error);
    }
}

export function formatDailyDigest(exceptions: any[]): string {
    if (exceptions.length === 0) {
        return "✅ Media QA Bot: No issues found today.";
    }

    let report = `🚨 **Media QA Bot Daily Digest**\n\nFound ${exceptions.length} exceptions across campaigns:\n\n`;
    
    exceptions.forEach(ex => {
        report += `- **${ex.campaignName}** (${ex.platform}): ${ex.errorType} (Exp: ${ex.expectedValue}, Act: ${ex.actualValue})\n`;
    });

    return report;
}
