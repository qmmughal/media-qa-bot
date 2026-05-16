"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsanaClient = void 0;
const asana = __importStar(require("asana"));
const types_1 = require("../engine/types");
class AsanaClient {
    client;
    constructor(token) {
        this.client = asana.Client.create().useAccessToken(token);
    }
    async getApprovedCampaigns(projectId) {
        // Fetch tasks from the specified project
        const tasksResponse = await this.client.tasks.getTasksForProject(projectId, {
            opt_fields: 'name,notes,due_on,start_on,custom_fields,memberships'
        });
        const tasks = tasksResponse.data;
        return tasks.map(task => {
            // Helper to find custom field value
            const getCustomFieldValue = (name) => {
                const field = task.custom_fields?.find((f) => f.name.toLowerCase().includes(name.toLowerCase()));
                return field?.display_value || field?.number_value || field?.text_value;
            };
            const budget = parseFloat(getCustomFieldValue('budget') || '0');
            const budgetTypeStr = getCustomFieldValue('budget type') || 'DAILY';
            return {
                id: task.gid,
                name: task.name,
                platform: types_1.Platform.ASANA,
                status: 'APPROVED',
                startDate: task.start_on || '',
                endDate: task.due_on || null,
                budget: budget,
                budgetType: budgetTypeStr.toUpperCase().includes('LIFETIME') ? types_1.BudgetType.LIFETIME : types_1.BudgetType.DAILY,
                currency: 'USD' // Default
            };
        });
    }
    async addComment(taskId, comment) {
        await this.client.stories.createStoryForTask(taskId, {
            text: comment
        });
    }
    async createSubtask(taskId, title, notes) {
        await this.client.tasks.createSubtaskForTask(taskId, {
            name: title,
            notes: notes
        });
    }
}
exports.AsanaClient = AsanaClient;
//# sourceMappingURL=asanaClient.js.map