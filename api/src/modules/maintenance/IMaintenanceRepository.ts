import { IMaintenanceRuleDoc } from "./maintenance.model";

export interface IMaintenanceRepository {
    create(data: Partial<IMaintenanceRuleDoc>): Promise<IMaintenanceRuleDoc>;
    findById(id: string): Promise<IMaintenanceRuleDoc | null>;
    find(filter?: any): Promise<IMaintenanceRuleDoc[]>;
    update(id: string, update: Partial<IMaintenanceRuleDoc>): Promise<IMaintenanceRuleDoc | null>;
    delete(id: string): Promise<void>;
}