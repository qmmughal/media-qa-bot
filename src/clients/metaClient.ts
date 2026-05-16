// @ts-ignore
import { FacebookAdsApi, AdAccount, Campaign } from 'facebook-nodejs-business-sdk';
import { CampaignData, Platform, BudgetType } from '../engine/types';

export class MetaClient {
    constructor(accessToken: string, adAccountId: string) {
        FacebookAdsApi.init(accessToken);
        this.adAccountId = `act_${adAccountId}`;
    }

    private adAccountId: string;

    async getLiveCampaigns(): Promise<CampaignData[]> {
        const account = new AdAccount(this.adAccountId);
        const campaigns = await account.getCampaigns([
            Campaign.Fields.id,
            Campaign.Fields.name,
            Campaign.Fields.status,
            Campaign.Fields.start_time,
            Campaign.Fields.stop_time,
            Campaign.Fields.daily_budget,
            Campaign.Fields.lifetime_budget,
        ]);

        return campaigns.map((c: any) => {
            const data = c.asObject();
            return {
                id: data.id,
                name: data.name,
                platform: Platform.META,
                status: data.status,
                startDate: data.start_time || '',
                endDate: data.stop_time || null,
                budget: parseFloat(data.daily_budget || data.lifetime_budget || '0') / 100,
                budgetType: data.daily_budget ? BudgetType.DAILY : BudgetType.LIFETIME,
                currency: 'USD'
            };
        });
    }
}
