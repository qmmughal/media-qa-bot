import { CampaignData } from '../engine/types';
export declare class MetaClient {
    constructor(accessToken: string, adAccountId: string);
    private adAccountId;
    getLiveCampaigns(): Promise<CampaignData[]>;
}
//# sourceMappingURL=metaClient.d.ts.map