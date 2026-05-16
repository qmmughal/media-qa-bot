import { GoogleAdsApi, enums } from 'google-ads-api';
import { CampaignData, Platform, BudgetType } from '../engine/types';

export class GoogleAdsClient {
    private client: GoogleAdsApi;
    private customerId: string;

    constructor(developerToken: string, clientId: string, clientSecret: string, refreshToken: string, customerId: string) {
        this.client = new GoogleAdsApi({
            client_id: clientId,
            client_secret: clientSecret,
            developer_token: developerToken,
        });
        this.customerId = customerId;
    }

    async getLiveCampaigns(refreshToken: string): Promise<CampaignData[]> {
        const customer = this.client.Customer({
            customer_id: this.customerId,
            refresh_token: refreshToken,
        });

        const campaigns = await customer.report({
            entity: 'campaign',
            attributes: [
                'campaign.id',
                'campaign.name',
                'campaign.status',
                'campaign.start_date',
                'campaign.end_date',
                'campaign_budget.amount_micros',
                'campaign_budget.type',
            ] as any,
            constraints: {
                'campaign.status': [enums.CampaignStatus.ENABLED, enums.CampaignStatus.PAUSED],
            },
        });

        return campaigns.map((row: any) => ({
            id: row.campaign?.id?.toString() || '',
            name: row.campaign?.name || '',
            platform: Platform.GOOGLE_ADS,
            status: row.campaign?.status?.toString() || '',
            startDate: row.campaign?.start_date || '',
            endDate: row.campaign?.end_date || null,
            budget: (row.campaign_budget?.amount_micros || 0) / 1000000,
            budgetType: BudgetType.DAILY, // Simplified for MVP
            currency: 'USD'
        }));
    }
}
