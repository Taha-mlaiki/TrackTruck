import { IMaintenanceRepository } from "./IMaintenanceRepository";
import { IMaintenanceRuleDoc, MaintenanceRuleModel } from "./maintenance.model";


export class MaintenanceRepository implements IMaintenanceRepository {
    async create(data: Partial<IMaintenanceRuleDoc>): Promise<IMaintenanceRuleDoc> {
       const maintenanceRule = new MaintenanceRuleModel(data);
       return maintenanceRule.save();
    }
    async findById(id: string): Promise<IMaintenanceRuleDoc | null> {
        return MaintenanceRuleModel.findById(id).exec();
    }
    async find(filter?: any): Promise<IMaintenanceRuleDoc[]> {
        return MaintenanceRuleModel.find(filter || {}).exec() ;
    }
    async update(id: string, update: Partial<IMaintenanceRuleDoc>): Promise<IMaintenanceRuleDoc | null> {
        return MaintenanceRuleModel.findByIdAndUpdate(id, update, { new: true }).exec();
    }
    async delete(id: string): Promise<void> {
        await MaintenanceRuleModel.findByIdAndDelete(id).exec();
    }
}