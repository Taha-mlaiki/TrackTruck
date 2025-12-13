"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchMaintenanceRules,
  createMaintenanceRule,
  updateMaintenanceRule,
  deleteMaintenanceRule,
} from "@/lib/features/maintenance/maintenanceSlice";
import { fetchTrucks } from "@/lib/features/trucks/trucksSlice";
import { fetchTrailers } from "@/lib/features/trailers/trailersSlice";
import { fetchTires } from "@/lib/features/tires/tiresSlice";
import { MaintenanceRule } from "@/lib/types";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createMaintenanceSchema, validateForm, ValidationErrors } from "@/lib/validations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
  const dispatch = useAppDispatch();
  const { items: rules, loading } = useAppSelector((state) => state.maintenance);
  const { items: trucks } = useAppSelector((state) => state.trucks);
  const { items: trailers } = useAppSelector((state) => state.trailers);
  const { items: tires } = useAppSelector((state) => state.tires);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MaintenanceRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    resourceType: "truck" as "truck" | "trailer" | "tire",
    resourceId: "",
    intervalKm: "",
    intervalDays: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchMaintenanceRules());
    dispatch(fetchTrucks());
    dispatch(fetchTrailers());
    dispatch(fetchTires());
  }, [dispatch]);

  const getResourceOptions = () => {
    switch (formData.resourceType) {
      case "truck":
        return trucks.map((t) => ({ id: t._id, label: `${t.plateNumber} - ${t.modelName}` }));
      case "trailer":
        return trailers.map((t) => ({ id: t._id, label: `${t.plateNumber} - ${t.type}` }));
      case "tire":
        return tires.map((t) => ({ id: t._id, label: t.serialNumber }));
      default:
        return [];
    }
  };

  const getResourceLabel = (type: string, id: string) => {
    switch (type) {
      case "truck":
        const truck = trucks.find((t) => t._id === id);
        return truck ? `${truck.plateNumber}` : id;
      case "trailer":
        const trailer = trailers.find((t) => t._id === id);
        return trailer ? `${trailer.plateNumber}` : id;
      case "tire":
        const tire = tires.find((t) => t._id === id);
        return tire ? tire.serialNumber : id;
      default:
        return id;
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setValidationErrors({});
    setFormData({
      resourceType: "truck",
      resourceId: "",
      intervalKm: "",
      intervalDays: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rule: MaintenanceRule) => {
    setEditingRule(rule);
    setValidationErrors({});
    setFormData({
      resourceType: rule.resourceType,
      resourceId: rule.resourceId,
      intervalKm: rule.intervalKm?.toString() || "",
      intervalDays: rule.intervalDays?.toString() || "",
      description: rule.description || "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = validateForm(createMaintenanceSchema, formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      resourceType: formData.resourceType,
      resourceId: formData.resourceId,
      intervalKm: formData.intervalKm ? parseInt(formData.intervalKm) : undefined,
      intervalDays: formData.intervalDays ? parseInt(formData.intervalDays) : undefined,
      description: formData.description || undefined,
    };

    if (editingRule) {
      await dispatch(updateMaintenanceRule({ id: editingRule._id, data }));
    } else {
      await dispatch(createMaintenanceRule(data));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteMaintenanceRule(deleteId));
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: "resourceType",
      label: "Resource Type",
      render: (v: string) => (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
          {v}
        </span>
      ),
    },
    {
      key: "resourceId",
      label: "Resource",
      render: (v: string, row: MaintenanceRule) => getResourceLabel(row.resourceType, v),
    },
    {
      key: "intervalKm",
      label: "Interval (km)",
      render: (v: number) => (v ? `${v.toLocaleString()} km` : "-"),
    },
    {
      key: "intervalDays",
      label: "Interval (days)",
      render: (v: number) => (v ? `${v} days` : "-"),
    },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground">Manage maintenance schedules</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        )}
      </div>

      <DataTable
        data={rules}
        columns={columns}
        loading={loading}
        actions={
          isAdmin
            ? (row: MaintenanceRule) => (
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
        title={editingRule ? "Edit Maintenance Rule" : "Add Maintenance Rule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resource Type <span className="text-destructive">*</span></Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    resourceType: value as "truck" | "trailer" | "tire",
                    resourceId: "",
                  });
                  if (validationErrors.resourceType) {
                    setValidationErrors((prev) => ({ ...prev, resourceType: "" }));
                  }
                }}
              >
                <SelectTrigger className={cn("w-full", validationErrors.resourceType && "border-destructive")}>
                  <SelectValue placeholder="Select Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="trailer">Trailer</SelectItem>
                  <SelectItem value="tire">Tire</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.resourceType && (
                <p className="text-xs text-destructive">{validationErrors.resourceType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Resource <span className="text-destructive">*</span></Label>
              <Select
                value={formData.resourceId}
                onValueChange={(value) => handleInputChange("resourceId", value)}
              >
                <SelectTrigger className={cn("w-full", validationErrors.resourceId && "border-destructive")}>
                  <SelectValue placeholder="Select Resource" />
                </SelectTrigger>
                <SelectContent>
                  {getResourceOptions().map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.resourceId && (
                <p className="text-xs text-destructive">{validationErrors.resourceId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Interval (km)</Label>
              <input
                type="number"
                value={formData.intervalKm}
                onChange={(e) => handleInputChange("intervalKm", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.intervalKm && "border-destructive"
                )}
                placeholder="e.g., 10000"
              />
              {validationErrors.intervalKm && (
                <p className="text-xs text-destructive">{validationErrors.intervalKm}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Interval (days)</Label>
              <input
                type="number"
                value={formData.intervalDays}
                onChange={(e) => handleInputChange("intervalDays", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.intervalDays && "border-destructive"
                )}
                placeholder="e.g., 30"
              />
              {validationErrors.intervalDays && (
                <p className="text-xs text-destructive">{validationErrors.intervalDays}</p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
                placeholder="Maintenance description..."
              />
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
              {editingRule ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Maintenance Rule"
        message="Are you sure you want to delete this maintenance rule? This action cannot be undone."
        confirmText="Delete Rule"
      />
    </div>
  );
}
