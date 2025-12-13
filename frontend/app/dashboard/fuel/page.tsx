"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchFuelRecords,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
} from "@/lib/features/fuel/fuelSlice";
import { fetchTrucks } from "@/lib/features/trucks/trucksSlice";
import { fetchTrips } from "@/lib/features/trips/tripsSlice";
import { Fuel } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Plus, Pencil, Trash2, Fuel as FuelIcon } from "lucide-react";
import { z } from "zod";
import { validateForm, ValidationErrors } from "@/lib/validations";
import { cn } from "@/lib/utils";

const createFuelSchema = z.object({
  truckId: z.string().min(1, "Truck is required"),
  tripId: z.string().optional(),
  liters: z.string().min(1, "Liters is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  costPerLiter: z.string().min(1, "Cost per liter is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  odometerAtFill: z.string().min(1, "Odometer is required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be non-negative"),
  station: z.string().optional(),
  fuelType: z.enum(["diesel", "gasoline"]),
  date: z.date({ message: "Date is required" }),
  notes: z.string().optional(),
});

export default function FuelPage() {
  const dispatch = useAppDispatch();
  const { items: fuelRecords, loading } = useAppSelector((state) => state.fuel);
  const { items: trucks } = useAppSelector((state) => state.trucks);
  const { items: trips } = useAppSelector((state) => state.trips);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState<Fuel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    truckId: "",
    tripId: "",
    liters: "",
    costPerLiter: "",
    odometerAtFill: "",
    station: "",
    fuelType: "diesel" as "diesel" | "gasoline",
    date: new Date() as Date | undefined,
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchFuelRecords());
    dispatch(fetchTrucks());
    dispatch(fetchTrips());
  }, [dispatch]);

  const openCreateModal = () => {
    setValidationErrors({});
    setEditingFuel(null);
    setFormData({
      truckId: "",
      tripId: "",
      liters: "",
      costPerLiter: "",
      odometerAtFill: "",
      station: "",
      fuelType: "diesel",
      date: new Date(),
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fuel: Fuel) => {
    setValidationErrors({});
    setEditingFuel(fuel);
    const truckId = typeof fuel.truck === "object" ? fuel.truck._id : fuel.truck;
    const tripId = typeof fuel.trip === "object" ? fuel.trip?._id : fuel.trip;
    setFormData({
      truckId,
      tripId: tripId || "",
      liters: fuel.liters.toString(),
      costPerLiter: fuel.costPerLiter.toString(),
      odometerAtFill: fuel.odometerAtFill.toString(),
      station: fuel.station || "",
      fuelType: fuel.fuelType,
      date: new Date(fuel.date),
      notes: fuel.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = validateForm(createFuelSchema, formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      truckId: formData.truckId,
      tripId: formData.tripId || undefined,
      liters: Number(formData.liters),
      costPerLiter: Number(formData.costPerLiter),
      odometerAtFill: Number(formData.odometerAtFill),
      station: formData.station || undefined,
      fuelType: formData.fuelType,
      date: formData.date?.toISOString() || new Date().toISOString(),
      notes: formData.notes || undefined,
    };

    if (editingFuel) {
      await dispatch(updateFuelRecord({ id: editingFuel._id, data }));
    } else {
      await dispatch(createFuelRecord(data));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteFuelRecord(deleteId));
      setDeleteId(null);
    }
  };

  const getTruckLabel = (truck: Fuel["truck"]) => {
    if (typeof truck === "object") {
      return `${truck.plateNumber} - ${truck.modelName}`;
    }
    const found = trucks.find((t) => t._id === truck);
    return found ? `${found.plateNumber} - ${found.modelName}` : truck;
  };

  const getFilledByLabel = (filledBy: Fuel["filledBy"]) => {
    if (typeof filledBy === "object") {
      return filledBy.name;
    }
    return filledBy;
  };

  // Calculate totals
  const totalLiters = fuelRecords.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = fuelRecords.reduce((sum, f) => sum + f.totalCost, 0);

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      key: "truck",
      label: "Truck",
      render: (v: Fuel["truck"]) => getTruckLabel(v),
    },
    {
      key: "liters",
      label: "Liters",
      render: (v: number) => `${v.toFixed(1)} L`,
    },
    {
      key: "costPerLiter",
      label: "Cost/L",
      render: (v: number) => `${v.toFixed(2)} MAD`,
    },
    {
      key: "totalCost",
      label: "Total Cost",
      render: (v: number) => `${v.toFixed(2)} MAD`,
    },
    {
      key: "odometerAtFill",
      label: "Odometer",
      render: (v: number) => `${v.toLocaleString()} km`,
    },
    {
      key: "fuelType",
      label: "Type",
      render: (v: string) => (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 capitalize">
          {v}
        </span>
      ),
    },
    {
      key: "filledBy",
      label: "Filled By",
      render: (v: Fuel["filledBy"]) => getFilledByLabel(v),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fuel Records</h1>
          <p className="text-muted-foreground">Track fuel consumption and costs</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Fuel Record
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FuelIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Liters</p>
              <p className="text-2xl font-bold">{totalLiters.toFixed(1)} L</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">MAD</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">{totalCost.toFixed(2)} MAD</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Records</p>
              <p className="text-2xl font-bold">{fuelRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={fuelRecords}
        columns={columns}
        loading={loading}
        actions={(row: Fuel) => (
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(row)}
              className="p-1 hover:bg-accent rounded"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1 hover:bg-destructive/10 text-destructive rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFuel ? "Edit Fuel Record" : "Add Fuel Record"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Truck <span className="text-destructive">*</span></Label>
              <Select
                value={formData.truckId}
                onValueChange={(value) => handleInputChange("truckId", value)}
              >
                <SelectTrigger className={cn("w-full", validationErrors.truckId && "border-destructive")}>
                  <SelectValue placeholder="Select Truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.plateNumber} - {t.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.truckId && (
                <p className="text-xs text-destructive">{validationErrors.truckId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Trip (Optional)</Label>
              <Select
                value={formData.tripId || "none"}
                onValueChange={(value) => handleInputChange("tripId", value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No Trip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Trip</SelectItem>
                  {trips.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.reference} - {t.origin} → {t.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Liters <span className="text-destructive">*</span></Label>
              <input
                type="number"
                step="0.1"
                value={formData.liters}
                onChange={(e) => handleInputChange("liters", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.liters && "border-destructive"
                )}
                placeholder="Enter liters"
              />
              {validationErrors.liters && (
                <p className="text-xs text-destructive">{validationErrors.liters}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cost per Liter (MAD) <span className="text-destructive">*</span></Label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerLiter}
                onChange={(e) => handleInputChange("costPerLiter", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.costPerLiter && "border-destructive"
                )}
                placeholder="Enter cost per liter"
              />
              {validationErrors.costPerLiter && (
                <p className="text-xs text-destructive">{validationErrors.costPerLiter}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Odometer (km) <span className="text-destructive">*</span></Label>
              <input
                type="number"
                value={formData.odometerAtFill}
                onChange={(e) => handleInputChange("odometerAtFill", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.odometerAtFill && "border-destructive"
                )}
                placeholder="Odometer reading at fill"
              />
              {validationErrors.odometerAtFill && (
                <p className="text-xs text-destructive">{validationErrors.odometerAtFill}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fuel Type <span className="text-destructive">*</span></Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => handleInputChange("fuelType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date <span className="text-destructive">*</span></Label>
              <DateTimePicker
                date={formData.date}
                onDateChange={(date) => handleInputChange("date", date)}
                placeholder="Select date and time"
                error={!!validationErrors.date}
              />
              {validationErrors.date && (
                <p className="text-xs text-destructive">{validationErrors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Station</Label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) => handleInputChange("station", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Station name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Additional notes..."
            />
          </div>

          {/* Show calculated total */}
          {formData.liters && formData.costPerLiter && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">
                Total Cost: <span className="text-lg">{(Number(formData.liters) * Number(formData.costPerLiter)).toFixed(2)} MAD</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingFuel ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Fuel Record"
        message="Are you sure you want to delete this fuel record? This action cannot be undone."
        confirmText="Delete Record"
      />
    </div>
  );
}
