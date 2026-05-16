import { CampaignData } from '../engine/types';
export declare class GoogleAdsClient {
    private client;
    private customerId;
    constructor(developerToken: string, clientId: string, clientSecret: string, refreshToken: string, customerId: string);
    getLiveCampaigns(refreshToken: string): Promise<CampaignData[]>;
}
//# sourceMappingURL=googleAdsClient.d.ts.map