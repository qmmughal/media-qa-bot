import * as asana from 'asana';
import { CampaignData, Platform, BudgetType } from '../engine/types';

export class AsanaClient {
    private client: any;

    constructor(token: string) {
        this.client = (asana as any).Client.create().useAccessToken(token);
    }

    async getApprovedCampaigns(projectId: string): Promise<CampaignData[]> {
        // Fetch tasks from the specified project
        const tasksResponse = await this.client.tasks.getTasksForProject(projectId, {
            opt_fields: 'name,notes,due_on,start_on,custom_fields,memberships'
        });

        const tasks = tasksResponse.data;
        
        return tasks.map((task: any) => {
            // Helper to find custom field value
            const getCustomFieldValue = (name: string) => {
                const field = (task as any).custom_fields?.find((f: any) => f.name.toLowerCase().includes(name.toLowerCase()));
                return field?.display_value || field?.number_value || field?.text_value;
            };

            const budget = parseFloat(getCustomFieldValue('budget') || '0');
            const budgetTypeStr = getCustomFieldValue('budget type') || 'DAILY';
            
            return {
                id: task.gid,
                name: task.name,
                platform: Platform.ASANA,
                status: 'APPROVED',
                startDate: (task as any).start_on || '',
                endDate: task.due_on || null,
                budget: budget,
                budgetType: budgetTypeStr.toUpperCase().includes('LIFETIME') ? BudgetType.LIFETIME : BudgetType.DAILY,
                currency: 'USD' // Default
            };
        });
    }

    async addComment(taskId: string, comment: string) {
        await this.client.stories.createStoryForTask(taskId, {
            text: comment
        });
    }

    async createSubtask(taskId: string, title: string, notes: string) {
        await this.client.tasks.createSubtaskForTask(taskId, {
            name: title,
            notes: notes
        });
    }
}
