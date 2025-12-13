import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./features/auth/authSlice";
import trucksReducer from "./features/trucks/trucksSlice";
import trailersReducer from "./features/trailers/trailersSlice";
import tiresReducer from "./features/tires/tiresSlice";
import tripsReducer from "./features/trips/tripsSlice";
import usersReducer from "./features/users/usersSlice";
import maintenanceReducer from "./features/maintenance/maintenanceSlice";
import notificationsReducer from "./features/notifications/notificationSlice";
import fuelReducer from "./features/fuel/fuelSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trucks: trucksReducer,
    trailers: trailersReducer,
    tires: tiresReducer,
    trips: tripsReducer,
    users: usersReducer,
    maintenance: maintenanceReducer,
    notifications: notificationsReducer,
    fuel: fuelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
