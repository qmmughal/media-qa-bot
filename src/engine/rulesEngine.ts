import { CampaignData, QAException, Platform, BudgetType } from './types';

export class RulesEngine {
    static validate(asanaCampaign: CampaignData, liveCampaign: CampaignData): QAException[] {
        const exceptions: QAException[] = [];
        const timestamp = new Date().toISOString();

        // 1. Start Date Check
        if (asanaCampaign.startDate && liveCampaign.startDate) {
            const asanaStart = new Date(asanaCampaign.startDate).toDateString();
            const liveStart = new Date(liveCampaign.startDate).toDateString();
            if (asanaStart !== liveStart) {
                exceptions.push({
                    campaignId: liveCampaign.id,
                    campaignName: liveCampaign.name,
                    platform: liveCampaign.platform,
                    errorType: 'WRONG_START_DATE',
                    expectedValue: asanaStart,
                    actualValue: liveStart,
                    severity: 'HIGH',
                    timestamp,
                    status: 'OPEN'
                });
            }
        }

        // 2. End Date Check
        if (asanaCampaign.endDate !== liveCampaign.endDate) {
            // Check if both are null or same date
            const asanaEnd = asanaCampaign.endDate ? new Date(asanaCampaign.endDate).toDateString() : 'None';
            const liveEnd = liveCampaign.endDate ? new Date(liveCampaign.endDate).toDateString() : 'None';
            
            if (asanaEnd !== liveEnd) {
                exceptions.push({
                    campaignId: liveCampaign.id,
                    campaignName: liveCampaign.name,
                    platform: liveCampaign.platform,
                    errorType: 'WRONG_END_DATE',
                    expectedValue: asanaEnd,
                    actualValue: liveEnd,
                    severity: 'HIGH',
                    timestamp,
                    status: 'OPEN'
                });
            }
        }

        // 3. Missing End Date Check
        if (asanaCampaign.endDate && !liveCampaign.endDate) {
            exceptions.push({
                campaignId: liveCampaign.id,
                campaignName: liveCampaign.name,
                platform: liveCampaign.platform,
                errorType: 'MISSING_END_DATE',
                expectedValue: asanaCampaign.endDate,
                actualValue: 'None',
                severity: 'HIGH',
                timestamp,
                status: 'OPEN'
            });
        }

        // 4. Budget Type Mismatch
        if (asanaCampaign.budgetType !== liveCampaign.budgetType) {
            exceptions.push({
                campaignId: liveCampaign.id,
                campaignName: liveCampaign.name,
                platform: liveCampaign.platform,
                errorType: 'BUDGET_TYPE_MISMATCH',
                expectedValue: asanaCampaign.budgetType,
                actualValue: liveCampaign.budgetType,
                severity: 'MEDIUM',
                timestamp,
                status: 'OPEN'
            });
        }

        // 5. Budget Amount Mismatch (> 5% variance)
        const variance = Math.abs(asanaCampaign.budget - liveCampaign.budget) / (asanaCampaign.budget || 1);
        if (variance > 0.05) {
            exceptions.push({
                campaignId: liveCampaign.id,
                campaignName: liveCampaign.name,
                platform: liveCampaign.platform,
                errorType: 'BUDGET_MISMATCH',
                expectedValue: asanaCampaign.budget.toString(),
                actualValue: liveCampaign.budget.toString(),
                severity: 'HIGH',
                timestamp,
                status: 'OPEN'
            });
        }

        return exceptions;
    }
}
