"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchTrucks,
  createTruck,
  updateTruck,
  deleteTruck,
} from "@/lib/features/trucks/trucksSlice";
import { Truck } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createTruckSchema, validateForm, ValidationErrors } from "@/lib/validations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function TrucksPage() {
  const dispatch = useAppDispatch();
  const { items: trucks, loading } = useAppSelector((state) => state.trucks);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    plateNumber: "",
    modelName: "",
    make: "",
    year: "",
    odometerKm: "",
    fuelCapacity: "",
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchTrucks());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingTruck(null);
    setValidationErrors({});
    setFormData({
      plateNumber: "",
      modelName: "",
      make: "",
      year: "",
      odometerKm: "",
      fuelCapacity: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (truck: Truck) => {
    setEditingTruck(truck);
    setValidationErrors({});
    setFormData({
      plateNumber: truck.plateNumber,
      modelName: truck.modelName,
      make: truck.make || "",
      year: truck.year?.toString() || "",
      odometerKm: truck.odometerKm.toString(),
      fuelCapacity: truck.fuelCapacity?.toString() || "",
      isActive: truck.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = validateForm(createTruckSchema, formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      plateNumber: formData.plateNumber,
      modelName: formData.modelName,
      make: formData.make || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      odometerKm: parseInt(formData.odometerKm) || 0,
      fuelCapacity: formData.fuelCapacity ? parseInt(formData.fuelCapacity) : undefined,
      isActive: formData.isActive,
    };

    if (editingTruck) {
      await dispatch(updateTruck({ id: editingTruck._id, data }));
    } else {
      await dispatch(createTruck(data));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteTruck(deleteId));
      setDeleteId(null);
    }
  };

  const columns = [
    { key: "plateNumber", label: "Plate Number" },
    { key: "modelName", label: "Model" },
    { key: "make", label: "Make" },
    { key: "year", label: "Year" },
    {
      key: "odometerKm",
      label: "Odometer (km)",
      render: (v: number) => v?.toLocaleString() || "0",
    },
    {
      key: "isActive",
      label: "Status",
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trucks</h1>
          <p className="text-muted-foreground">Manage your truck fleet</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Truck
          </button>
        )}
      </div>

      <DataTable
        data={trucks}
        columns={columns}
        loading={loading}
        actions={
          isAdmin
            ? (row: Truck) => (
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
              )
            : undefined
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTruck ? "Edit Truck" : "Add Truck"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Plate Number <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.plateNumber ? "border-destructive" : ""
                }`}
              />
              {validationErrors.plateNumber && (
                <p className="text-xs text-destructive">{validationErrors.plateNumber}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Model Name <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => handleInputChange("modelName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.modelName ? "border-destructive" : ""
                }`}
              />
              {validationErrors.modelName && (
                <p className="text-xs text-destructive">{validationErrors.modelName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.year ? "border-destructive" : ""
                }`}
              />
              {validationErrors.year && (
                <p className="text-xs text-destructive">{validationErrors.year}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Odometer (km) <span className="text-destructive">*</span></label>
              <input
                type="number"
                value={formData.odometerKm}
                onChange={(e) => handleInputChange("odometerKm", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.odometerKm ? "border-destructive" : ""
                }`}
              />
              {validationErrors.odometerKm && (
                <p className="text-xs text-destructive">{validationErrors.odometerKm}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fuel Capacity (L)</label>
              <input
                type="number"
                value={formData.fuelCapacity}
                onChange={(e) => handleInputChange("fuelCapacity", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.fuelCapacity ? "border-destructive" : ""
                }`}
              />
              {validationErrors.fuelCapacity && (
                <p className="text-xs text-destructive">{validationErrors.fuelCapacity}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm">
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {editingTruck ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Truck"
        message="Are you sure you want to delete this truck? This action cannot be undone."
        confirmText="Delete Truck"
      />
    </div>
  );
}
