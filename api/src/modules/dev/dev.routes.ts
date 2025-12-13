import { Router, Request, Response } from "express";
import { getIO } from "../../utils/socket";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

// Test endpoint to send notifications (Admin only, remove in production)
router.post("/test-notification", requireAuth, requireRole(["Admin"]), (req: Request, res: Response) => {
  const { type = "maintenance", message = "Test notification" } = req.body;
  
  const io = getIO();
  
  const notificationData = {
    message,
    timestamp: new Date().toISOString(),
    test: true,
  };

  switch (type) {
    case "maintenance":
      io.to("admins").emit("maintenanceNotification", notificationData);
      break;
    case "trip":
      io.to("admins").emit("tripNotification", notificationData);
      break;
    case "system":
      io.to("admins").emit("systemNotification", notificationData);
      break;
    default:
      io.to("admins").emit("maintenanceNotification", notificationData);
  }

  res.json({ success: true, message: "Notification sent", data: notificationData });
});

export default router;
