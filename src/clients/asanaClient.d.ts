import { CampaignData } from '../engine/types';
export declare class AsanaClient {
    private client;
    constructor(token: string);
    getApprovedCampaigns(projectId: string): Promise<CampaignData[]>;
    addComment(taskId: string, comment: string): Promise<void>;
    createSubtask(taskId: string, title: string, notes: string): Promise<void>;
}
//# sourceMappingURL=asanaClient.d.ts.map