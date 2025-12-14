"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2, Wrench, AlertCircle, Truck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { markAsRead, markAllAsRead, clearNotifications, addNotification } from "@/lib/features/notifications/notificationSlice";
import { connectSocket, joinAdminsRoom, joinDriverRoom } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasSetupListeners = useRef(false);

  // Connect to socket and listen for notifications
  useEffect(() => {
    if (!user || hasSetupListeners.current) {
      return;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      if (user.role === "Admin") {
        joinAdminsRoom();
      } else if (user.role === "Driver") {
        joinDriverRoom(user._id);
      }
    };

    const handleMaintenanceNotification = (data: { message: string; [key: string]: unknown }) => {
      dispatch(
        addNotification({
          message: data.message,
          type: "maintenance",
          data,
        })
      );
    };

    const handleTripNotification = (data: { message: string; [key: string]: unknown }) => {
      dispatch(
        addNotification({
          message: data.message,
          type: "trip",
          data,
        })
      );
    };

    const handleSystemNotification = (data: { message: string; [key: string]: unknown }) => {
      dispatch(
        addNotification({
          message: data.message,
          type: "system",
          data,
        })
      );
    };

    // Handler for trip assignment (for drivers)
    const handleTripAssigned = (data: { message: string; [key: string]: unknown }) => {
      dispatch(
        addNotification({
          message: data.message,
          type: "trip",
          data,
        })
      );
      // Show a toast notification
      toast.success("Nouveau trajet assigné!", {
        description: data.message as string,
        duration: 5000,
      });
    };

    // Set up listeners
    socket.on("connect", handleConnect);
    socket.on("maintenanceNotification", handleMaintenanceNotification);
    socket.on("tripNotification", handleTripNotification);
    socket.on("systemNotification", handleSystemNotification);
    socket.on("tripAssigned", handleTripAssigned);

    // If already connected, join the appropriate room
    if (socket.connected) {
      if (user.role === "Admin") {
        joinAdminsRoom();
      } else if (user.role === "Driver") {
        joinDriverRoom(user._id);
      }
    }

    hasSetupListeners.current = true;

    return () => {
      socket.off("connect", handleConnect);
      socket.off("maintenanceNotification", handleMaintenanceNotification);
      socket.off("tripNotification", handleTripNotification);
      socket.off("systemNotification", handleSystemNotification);
      socket.off("tripAssigned", handleTripAssigned);
      hasSetupListeners.current = false;
    };
  }, [dispatch, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case "trip":
        return <Truck className="h-4 w-4 text-emerald-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-violet-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  // Show notification center for both Admin and Driver
  if (!user || (user.role !== "Admin" && user.role !== "Driver")) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg z-50">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              items.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 border-b last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                    !notification.read && "bg-accent/30"
                  )}
                  onClick={() => dispatch(markAsRead(notification.id))}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
