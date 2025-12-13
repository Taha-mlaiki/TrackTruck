import { getIO } from "../../../utils/socket";


export function notifyAdmin(message: string, data?: any) {
  const io = getIO();
  io.to("admins").emit("maintenanceNotification", { message, ...data });
}
