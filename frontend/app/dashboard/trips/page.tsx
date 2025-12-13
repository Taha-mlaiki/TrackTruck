"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchTrips, createTrip, updateTripStatus, downloadTripPdf } from "@/lib/features/trips/tripsSlice";
import { fetchTrucks } from "@/lib/features/trucks/trucksSlice";
import { fetchTrailers } from "@/lib/features/trailers/trailersSlice";
import { fetchUsers } from "@/lib/features/users/usersSlice";
import { Trip, TripStatus } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
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
import { Plus, Play, CheckCircle, XCircle, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTripSchema, validateForm, ValidationErrors } from "@/lib/validations";

export default function TripsPage() {
  const dispatch = useAppDispatch();
  const { items: trips, loading } = useAppSelector((state) => state.trips);
  const { items: trucks } = useAppSelector((state) => state.trucks);
  const { items: trailers } = useAppSelector((state) => state.trailers);
  const { items: users } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const drivers = users.filter((u) => u.role === "Driver");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TripStatus | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [updateFormData, setUpdateFormData] = useState({
    startOdometer: "",
    endOdometer: "",
    fuelConsumedLiters: "",
    remarks: "",
  });
  const [formData, setFormData] = useState({
    reference: "",
    origin: "",
    destination: "",
    plannedStart: undefined as Date | undefined,
    plannedEnd: undefined as Date | undefined,
    truckId: "",
    trailerId: "",
    driverId: "",
  });

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchTrucks());
    dispatch(fetchTrailers());
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreateModal = () => {
    setValidationErrors({});
    setFormData({
      reference: "",
      origin: "",
      destination: "",
      plannedStart: undefined,
      plannedEnd: undefined,
      truckId: "",
      trailerId: "",
      driverId: "",
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

    const submitData = {
      ...formData,
      plannedStart: formData.plannedStart && !isNaN(formData.plannedStart.getTime()) 
        ? formData.plannedStart.toISOString() 
        : "",
      plannedEnd: formData.plannedEnd && !isNaN(formData.plannedEnd.getTime()) 
        ? formData.plannedEnd.toISOString() 
        : "",
    };

    const validation = validateForm(createTripSchema, submitData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      reference: formData.reference,
      origin: formData.origin,
      destination: formData.destination,
      plannedStart: (formData.plannedStart && !isNaN(formData.plannedStart.getTime())) 
      ? formData.plannedStart.toISOString() 
      : undefined,
      plannedEnd: (formData.plannedEnd && !isNaN(formData.plannedEnd.getTime())) 
      ? formData.plannedEnd.toISOString() 
      : undefined,
      truckId: formData.truckId,
      trailerId: formData.trailerId || undefined,
      driverId: formData.driverId,
    };
    await dispatch(createTrip(data));
    setIsModalOpen(false);
  };

  const handleStatusUpdate = async (id: string, status: TripStatus) => {
    const trip = trips.find((t) => t._id === id);
    if (!trip) return;

    // For starting a trip, show modal to enter start odometer
    if (status === "in_progress") {
      setSelectedTrip(trip);
      setPendingStatus(status);
      setUpdateFormData({
        startOdometer: trip.startOdometer?.toString() || "",
        endOdometer: "",
        fuelConsumedLiters: "",
        remarks: trip.remarks || "",
      });
      setIsUpdateModalOpen(true);
      return;
    }

    // For completing a trip, show modal to enter end odometer, fuel, remarks
    if (status === "completed") {
      setSelectedTrip(trip);
      setPendingStatus(status);
      setUpdateFormData({
        startOdometer: trip.startOdometer?.toString() || "",
        endOdometer: trip.endOdometer?.toString() || "",
        fuelConsumedLiters: trip.fuelConsumedLiters?.toString() || "",
        remarks: trip.remarks || "",
      });
      setIsUpdateModalOpen(true);
      return;
    }

    // For cancelled, just update status
    await dispatch(updateTripStatus({ id, status }));
  };

  const handleUpdateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !pendingStatus) return;

    const data: Partial<Trip> = {};
    
    if (updateFormData.startOdometer) {
      data.startOdometer = Number(updateFormData.startOdometer);
    }
    if (updateFormData.endOdometer) {
      data.endOdometer = Number(updateFormData.endOdometer);
    }
    if (updateFormData.fuelConsumedLiters) {
      data.fuelConsumedLiters = Number(updateFormData.fuelConsumedLiters);
    }
    if (updateFormData.remarks) {
      data.remarks = updateFormData.remarks;
    }

    // Validate required fields
    if (pendingStatus === "in_progress" && !data.startOdometer) {
      setValidationErrors({ startOdometer: "Start odometer is required" });
      return;
    }
    if (pendingStatus === "completed" && !data.endOdometer) {
      setValidationErrors({ endOdometer: "End odometer is required" });
      return;
    }

    await dispatch(updateTripStatus({ id: selectedTrip._id, status: pendingStatus, data }));
    setIsUpdateModalOpen(false);
    setSelectedTrip(null);
    setPendingStatus(null);
  };

  const handleDownloadPdf = async (id: string) => {
    await dispatch(downloadTripPdf(id));
  };

  const columns = [
    { key: "reference", label: "Reference" },
    { key: "origin", label: "Origin" },
    { key: "destination", label: "Destination" },
    {
      key: "plannedStart",
      label: "Planned Start",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (v: TripStatus) => (
        <span
          className={cn(
            "px-2 py-1 text-xs rounded-full",
            v === "completed" && "bg-green-100 text-green-700",
            v === "in_progress" && "bg-blue-100 text-blue-700",
            v === "pending" && "bg-yellow-100 text-yellow-700",
            v === "cancelled" && "bg-red-100 text-red-700"
          )}
        >
          {v.replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-muted-foreground">Manage trips and deliveries</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Trip
          </button>
        )}
      </div>

      <DataTable
        data={trips}
        columns={columns}
        loading={loading}
        actions={(row: Trip) => (
          <div className="flex gap-1">
            {row.status === "pending" && (
              <button
                onClick={() => handleStatusUpdate(row._id, "in_progress")}
                className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                title="Start Trip"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            {row.status === "in_progress" && (
              <>
                <button
                  onClick={() => handleStatusUpdate(row._id, "completed")}
                  className="p-1 hover:bg-green-100 text-green-600 rounded"
                  title="Complete Trip"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleStatusUpdate(row._id, "cancelled")}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                  title="Cancel Trip"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
            {row.status === "completed" && (
              <button
                onClick={() => handleDownloadPdf(row._id)}
                className="p-1 hover:bg-accent rounded"
                title="Download PDF"
              >
                <FileDown className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Trip">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference <span className="text-destructive">*</span></Label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.reference && "border-destructive"
                )}
                placeholder="TRP-001"
              />
              {validationErrors.reference && (
                <p className="text-xs text-destructive">{validationErrors.reference}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Driver <span className="text-destructive">*</span></Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => handleInputChange("driverId", value)}
              >
                <SelectTrigger className={cn("w-full", validationErrors.driverId && "border-destructive")}>
                  <SelectValue placeholder="Select Driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.driverId && (
                <p className="text-xs text-destructive">{validationErrors.driverId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Origin <span className="text-destructive">*</span></Label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange("origin", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.origin && "border-destructive"
                )}
              />
              {validationErrors.origin && (
                <p className="text-xs text-destructive">{validationErrors.origin}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Destination <span className="text-destructive">*</span></Label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.destination && "border-destructive"
                )}
              />
              {validationErrors.destination && (
                <p className="text-xs text-destructive">{validationErrors.destination}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Planned Start <span className="text-destructive">*</span></Label>
              <DateTimePicker
                date={formData.plannedStart}
                onDateChange={(date) => handleInputChange("plannedStart", date)}
                placeholder="Select date and time"
                error={!!validationErrors.plannedStart}
              />
              {validationErrors.plannedStart && (
                <p className="text-xs text-destructive">{validationErrors.plannedStart}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Planned End</Label>
              <DateTimePicker
                date={formData.plannedEnd}
                onDateChange={(date) => handleInputChange("plannedEnd", date)}
                placeholder="Select date and time"
                error={!!validationErrors.plannedEnd}
              />
              {validationErrors.plannedEnd && (
                <p className="text-xs text-destructive">{validationErrors.plannedEnd}</p>
              )}
            </div>
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
                  {trucks
                    .filter((t) => t.isActive)
                    .map((t) => (
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
              <Label>Trailer</Label>
              <Select
                value={formData.trailerId || "none"}
                onValueChange={(value) => handleInputChange("trailerId", value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No Trailer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Trailer</SelectItem>
                  {trailers
                    .filter((t) => t.status === "available")
                    .map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.plateNumber} - {t.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Trip Update Modal - For drivers to enter odometer, fuel, remarks */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTrip(null);
          setPendingStatus(null);
          setValidationErrors({});
        }}
        title={pendingStatus === "in_progress" ? "Start Trip" : "Complete Trip"}
      >
        <form onSubmit={handleUpdateFormSubmit} className="space-y-4">
          {selectedTrip && (
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p><span className="font-medium">Reference:</span> {selectedTrip.reference}</p>
              <p><span className="font-medium">Route:</span> {selectedTrip.origin} → {selectedTrip.destination}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Start Odometer (km) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={updateFormData.startOdometer}
                onChange={(e) => {
                  setUpdateFormData({ ...updateFormData, startOdometer: e.target.value });
                  if (validationErrors.startOdometer) {
                    setValidationErrors((prev) => ({ ...prev, startOdometer: "" }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.startOdometer ? "border-destructive" : ""
                }`}
                placeholder="Enter start odometer"
                disabled={pendingStatus === "completed" && !!selectedTrip?.startOdometer}
              />
              {validationErrors.startOdometer && (
                <p className="text-xs text-destructive">{validationErrors.startOdometer}</p>
              )}
            </div>

            {pendingStatus === "completed" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  End Odometer (km) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={updateFormData.endOdometer}
                  onChange={(e) => {
                    setUpdateFormData({ ...updateFormData, endOdometer: e.target.value });
                    if (validationErrors.endOdometer) {
                      setValidationErrors((prev) => ({ ...prev, endOdometer: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    validationErrors.endOdometer ? "border-destructive" : ""
                  }`}
                  placeholder="Enter end odometer"
                />
                {validationErrors.endOdometer && (
                  <p className="text-xs text-destructive">{validationErrors.endOdometer}</p>
                )}
              </div>
            )}

            {pendingStatus === "completed" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Fuel Consumed (liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={updateFormData.fuelConsumedLiters}
                  onChange={(e) =>
                    setUpdateFormData({ ...updateFormData, fuelConsumedLiters: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter fuel consumed"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Vehicle Remarks</label>
            <textarea
              value={updateFormData.remarks}
              onChange={(e) =>
                setUpdateFormData({ ...updateFormData, remarks: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md bg-background min-h-20"
              placeholder="Any notes about vehicle condition, issues, or observations..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setSelectedTrip(null);
                setPendingStatus(null);
                setValidationErrors({});
              }}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "px-4 py-2 rounded-md text-white",
                pendingStatus === "in_progress"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {pendingStatus === "in_progress" ? "Start Trip" : "Complete Trip"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
