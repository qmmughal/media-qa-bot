"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAdsClient = void 0;
const google_ads_api_1 = require("google-ads-api");
const types_1 = require("../engine/types");
class GoogleAdsClient {
    client;
    customerId;
    constructor(developerToken, clientId, clientSecret, refreshToken, customerId) {
        this.client = new google_ads_api_1.GoogleAdsApi({
            client_id: clientId,
            client_secret: clientSecret,
            developer_token: developerToken,
        });
        this.customerId = customerId;
    }
    async getLiveCampaigns(refreshToken) {
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
            ],
            constraints: {
                'campaign.status': [google_ads_api_1.enums.CampaignStatus.ENABLED, google_ads_api_1.enums.CampaignStatus.PAUSED],
            },
        });
        return campaigns.map(row => ({
            id: row.campaign.id.toString(),
            name: row.campaign.name,
            platform: types_1.Platform.GOOGLE_ADS,
            status: row.campaign.status.toString(),
            startDate: row.campaign.start_date,
            endDate: row.campaign.end_date || null,
            budget: (row.campaign_budget?.amount_micros || 0) / 1000000,
            budgetType: row.campaign_budget?.type === google_ads_api_1.enums.BudgetDeliveryMethod.STANDARD ? types_1.BudgetType.DAILY : types_1.BudgetType.DAILY, // Simplified for MVP
            currency: 'USD'
        }));
    }
}
exports.GoogleAdsClient = GoogleAdsClient;
//# sourceMappingURL=googleAdsClient.js.map