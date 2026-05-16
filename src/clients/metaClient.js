"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaClient = void 0;
const facebook_nodejs_business_sdk_1 = require("facebook-nodejs-business-sdk");
const types_1 = require("../engine/types");
class MetaClient {
    constructor(accessToken, adAccountId) {
        facebook_nodejs_business_sdk_1.FacebookAdsApi.init(accessToken);
        this.adAccountId = `act_${adAccountId}`;
    }
    adAccountId;
    async getLiveCampaigns() {
        const account = new facebook_nodejs_business_sdk_1.AdAccount(this.adAccountId);
        const campaigns = await account.getCampaigns([
            facebook_nodejs_business_sdk_1.Campaign.Fields.id,
            facebook_nodejs_business_sdk_1.Campaign.Fields.name,
            facebook_nodejs_business_sdk_1.Campaign.Fields.status,
            facebook_nodejs_business_sdk_1.Campaign.Fields.start_time,
            facebook_nodejs_business_sdk_1.Campaign.Fields.stop_time,
            facebook_nodejs_business_sdk_1.Campaign.Fields.daily_budget,
            facebook_nodejs_business_sdk_1.Campaign.Fields.lifetime_budget,
        ]);
        return campaigns.map(c => {
            const data = c.asObject();
            return {
                id: data.id,
                name: data.name,
                platform: types_1.Platform.META,
                status: data.status,
                startDate: data.start_time || '',
                endDate: data.stop_time || null,
                budget: parseFloat(data.daily_budget || data.lifetime_budget || '0') / 100,
                budgetType: data.daily_budget ? types_1.BudgetType.DAILY : types_1.BudgetType.LIFETIME,
                currency: 'USD'
            };
        });
    }
}
exports.MetaClient = MetaClient;
//# sourceMappingURL=metaClient.js.map