import logger from "../../../cors/logger";
import cron from "node-cron";
import { TruckRepository } from "../../fleet/trucks/repositories/TruckRepository";
import { TireRepository } from "../../fleet/tires/repositories/TireRepository";
import { NotFoundError } from "../../../cors/errors/NotFoundError";
import { MaintenanceRepository } from "../repositories/MaintenanceRepository";
import { TrailerRepository } from "../../fleet/trailers/repositories/TrailerRepository";

export class MaintenanceService {
  constructor(
    private MaintenaceRepo :MaintenanceRepository,
    private TruckRepo : TruckRepository,
    private TrailerRepo : TrailerRepository,
    private TireRepo : TireRepository
  ) {}

  getAllMaintenace = async (filter?: any) => {
    return this.MaintenaceRepo.find(filter);
  }
  getMaintencance = async (id: string) => {
    const maintenance= await this.MaintenaceRepo.findById(id);
    if(!maintenance) throw new NotFoundError("Maintenance not found");
    return maintenance;
  }
  createMaintenace = async (data: any) => {
    return this.MaintenaceRepo.create(data);
  }
  updateMaintenace = async (id: string, data: any) => {
    const maintenanceExist= await this.MaintenaceRepo.findById(id);
    if(!maintenanceExist) throw new NotFoundError("Maintenance not found");
    const updated = await this.MaintenaceRepo.update(id, data);
    return updated;
  }
    deleteMaintenace = async (id: string) => {
    const maintenanceExist= await this.MaintenaceRepo.findById(id);
    if(!maintenanceExist) throw new NotFoundError("Maintenance not found");
    await this.MaintenaceRepo.delete(id);
  }


//   async checkAllRules() {
//     const rules = await this.MaintenaceRepo.find();
//     for (const r of rules) {
//       if (r.resourceType === "truck") {
//         const trucks = await this.TruckRepo.find();
//         for (const t of trucks) {
//           // simple example: if intervalKm exists and truck odometer is beyond threshold
//           if (r.intervalKm && t.odometerKm >= r.intervalKm) {
//             // mark on truck (simple flag) or create maintenance task in future
//             logger.info(`Maintenance alert: truck ${t.plateNumber} reached interval ${r.intervalKm}km`);

//         }
//         }
//       }
//       // other resource types similar
//     }
//   }

//   scheduleDaily() {
//     cron.schedule("0 8 * * *", async () => {
//       logger.info("Running maintenance checks...");
//       await this.checkAllRules();
//     });
//   }
}
