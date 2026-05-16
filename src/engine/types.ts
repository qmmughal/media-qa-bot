export enum Platform {
    GOOGLE_ADS = 'GOOGLE_ADS',
    META = 'META',
    ASANA = 'ASANA'
}

export enum BudgetType {
    DAILY = 'DAILY',
    LIFETIME = 'LIFETIME'
}

export interface CampaignData {
    id: string;
    name: string;
    platform: Platform;
    status: string;
    startDate: string; // ISO string
    endDate: string | null;
    budget: number;
    budgetType: BudgetType;
    currency: string;
}

export interface QAException {
    id?: number;
    campaignId: string;
    campaignName: string;
    platform: Platform;
    errorType: string;
    expectedValue: string;
    actualValue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp: string;
    status: 'OPEN' | 'RESOLVED';
}
