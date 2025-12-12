import logger from "../../utils/logger";
import cron from "node-cron";
import { TruckRepository } from "../fleet/trucks/TruckRepository";
import { TireRepository } from "../fleet/tires/TireRepository";
import { MaintenanceRepository } from "./MaintenanceRepository";
import { TrailerRepository } from "../fleet/trailers/TrailerRepository";
import { NotFoundError } from "../../errors/NotFoundError";

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



  async checkAllRules() {
    const rules = await this.MaintenaceRepo.find();
    for (const rule of rules) {
      let asset: any = null;
      if (rule.resourceType === "truck") {
        asset = await this.TruckRepo.findById(rule.resourceId.toString());
      } else if (rule.resourceType === "trailer") {
        asset = await this.TrailerRepo.findById(rule.resourceId.toString());
      } else if (rule.resourceType === "tire") {
        asset = await this.TireRepo.findById(rule.resourceId.toString());
      }
      if (!asset) continue;

      // Check by km/mileage/wearLevel
      if (rule.resourceType === "truck" && rule.intervalKm && asset.odometerKm >= rule.intervalKm) {
        logger.info(`Maintenance alert: truck ${asset.plateNumber} reached interval ${rule.intervalKm}km`);
        // notifyAdmin(asset, rule);
      }
      if (rule.resourceType === "trailer" && rule.intervalKm && asset.mileage >= rule.intervalKm) {
        logger.info(`Maintenance alert: trailer ${asset.plateNumber} reached interval ${rule.intervalKm}km`);
        // notifyAdmin(asset, rule);
      }
      if (rule.resourceType === "tire" && rule.intervalKm && asset.wearLevel >= rule.intervalKm) {
        logger.info(`Maintenance alert: tire ${asset.serialNumber} reached wear level ${rule.intervalKm}`);
        // notifyAdmin(asset, rule);
      }

      // Check by days
      if (rule.intervalDays && rule.lastRun) {
        const nextDue = new Date(rule.lastRun);
        nextDue.setDate(nextDue.getDate() + rule.intervalDays);
        if (new Date() >= nextDue) {
          logger.info(`Maintenance alert: ${rule.resourceType} ${asset.plateNumber || asset.serialNumber} is due by days interval (${rule.intervalDays} days)`);
          // notifyAdmin(asset, rule);
        }
      }
    }
  }

//   scheduleDaily() {
//     cron.schedule("0 8 * * *", async () => {
//       logger.info("Running maintenance checks...");
//       await this.checkAllRules();
//     });
//   }
}
