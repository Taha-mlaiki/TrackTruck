
import cron from "node-cron";
import { MaintenanceRepository } from "../MaintenanceRepository";
import { TruckRepository } from "../../fleet/trucks/TruckRepository";
import { TrailerRepository } from "../../fleet/trailers/TrailerRepository";
import { TireRepository } from "../../fleet/tires/TireRepository";
import { NotFoundError } from "../../../errors/NotFoundError";
import logger from "../../../utils/logger";
import { notifyAdmin } from "./notification.service";


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
        const msg = `Maintenance alert: truck ${asset.plateNumber} reached interval ${rule.intervalKm}km`;
        logger.info(msg);
        notifyAdmin(msg, { type: "truck", id: asset._id });
      }
      if (rule.resourceType === "trailer" && rule.intervalKm && asset.mileage >= rule.intervalKm) {
        const msg = `Maintenance alert: trailer ${asset.plateNumber} reached interval ${rule.intervalKm}km`;
        logger.info(msg);
        notifyAdmin(msg, { type: "trailer", id: asset._id });
      }
      if (rule.resourceType === "tire" && rule.intervalKm && asset.wearLevel >= rule.intervalKm) {
        const msg = `Maintenance alert: tire ${asset.serialNumber} reached wear level ${rule.intervalKm}`;
        logger.info(msg);
        notifyAdmin(msg, { type: "tire", id: asset._id });
      }

      // Check by days
      if (rule.intervalDays && rule.lastRun) {
        const nextDue = new Date(rule.lastRun);
        nextDue.setDate(nextDue.getDate() + rule.intervalDays);
        if (new Date() >= nextDue) {
          const msg = `Maintenance alert: ${rule.resourceType} ${asset.plateNumber || asset.serialNumber} is due by days interval (${rule.intervalDays} days)`;
          logger.info(msg);
          notifyAdmin(msg, { type: rule.resourceType, id: asset._id });
        }
      }
    }
  }

  scheduleDaily() {
    cron.schedule("0 8 * * *", async () => {
      logger.info("Running maintenance checks...");
      await this.checkAllRules();
    });
  }
}
