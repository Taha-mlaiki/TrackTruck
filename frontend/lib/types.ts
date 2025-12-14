export type UserRole = "Admin" | "Driver";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TripStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Truck {
  _id: string;
  plateNumber: string;
  modelName: string;
  make?: string;
  year?: number;
  odometerKm: number;
  fuelCapacity?: number;
  tires?: string[];
  isActive?: boolean;
  assignedTo?: string | null;
}

export interface Trailer {
  _id: string;
  plateNumber: string;
  type: string;
  status: "available" | "in_use" | "maintenance";
  mileage: number;
}

export interface Tire {
  _id: string;
  serialNumber: string;
  wearLevel: number;
  status: "new" | "in_use" | "worn_out";
  position?: string;
  assignedTo?: string;
  assignedType?: "truck" | "trailer";
}

export interface Trip {
  _id: string;
  reference: string;
  origin: string;
  destination: string;
  plannedStart: string;
  plannedEnd?: string;
  truck: string;
  trailer?: string;
  driver: string;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  fuelConsumedLiters?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRule {
  _id: string;
  resourceType: "truck" | "trailer" | "tire";
  resourceId: string;
  intervalKm?: number;
  intervalDays?: number;
  lastRun?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FuelType = "diesel" | "gasoline";

export interface Fuel {
  _id: string;
  truck: string | { _id: string; plateNumber: string; modelName: string };
  trip?: string | { _id: string; reference: string; origin: string; destination: string };
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerAtFill: number;
  station?: string;
  fuelType: FuelType;
  filledBy: string | { _id: string; name: string; email: string };
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FuelStats {
  totalLiters: number;
  totalCost: number;
  avgCostPerLiter: number;
  recordCount: number;
}