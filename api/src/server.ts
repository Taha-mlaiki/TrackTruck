
import app from "./app";
import config from "./config";
import { connectDB } from "./db/mongoose";
import { MaintenanceRepository } from "./modules/maintenance/MaintenanceRepository";
import { TruckRepository } from "./modules/fleet/trucks/TruckRepository";
import { TrailerRepository } from "./modules/fleet/trailers/TrailerRepository";
import { TireRepository } from "./modules/fleet/tires/TireRepository";
import logger from "./utils/logger";
import http from "http";
import { initSocket } from "./utils/socket";
import { MaintenanceService } from "./modules/maintenance/services/MaintenanceService";


const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  const maintenance = new MaintenanceService(
    new MaintenanceRepository(),
    new TruckRepository(),
    new TrailerRepository(),
    new TireRepository()
  );
  maintenance.scheduleDaily && maintenance.scheduleDaily();
  server.listen(config.PORT, () => {
    logger.info(`Server listening on ${config.PORT}`);
  });
};

start().catch(err => {
  logger.error("Failed to start", err as any);
  process.exit(1);
});
