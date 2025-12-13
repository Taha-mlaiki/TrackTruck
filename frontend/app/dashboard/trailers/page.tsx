"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchTrailers,
  createTrailer,
  updateTrailer,
  deleteTrailer,
} from "@/lib/features/trailers/trailersSlice";
import { Trailer } from "@/lib/types";
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
import { createTrailerSchema, validateForm, ValidationErrors } from "@/lib/validations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function TrailersPage() {
  const dispatch = useAppDispatch();
  const { items: trailers, loading } = useAppSelector((state) => state.trailers);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    plateNumber: "",
    type: "",
    status: "available" as "available" | "in_use" | "maintenance",
    mileage: "",
  });

  useEffect(() => {
    dispatch(fetchTrailers());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingTrailer(null);
    setValidationErrors({});
    setFormData({
      plateNumber: "",
      type: "",
      status: "available",
      mileage: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trailer: Trailer) => {
    setEditingTrailer(trailer);
    setValidationErrors({});
    setFormData({
      plateNumber: trailer.plateNumber,
      type: trailer.type,
      status: trailer.status,
      mileage: trailer.mileage.toString(),
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

    const validation = validateForm(createTrailerSchema, formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      plateNumber: formData.plateNumber,
      type: formData.type,
      status: formData.status,
      mileage: parseInt(formData.mileage) || 0,
    };

    if (editingTrailer) {
      await dispatch(updateTrailer({ id: editingTrailer._id, data }));
    } else {
      await dispatch(createTrailer(data));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteTrailer(deleteId));
      setDeleteId(null);
    }
  };

  const columns = [
    { key: "plateNumber", label: "Plate Number" },
    { key: "type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (v: string) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            v === "available"
              ? "bg-green-100 text-green-700"
              : v === "in_use"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {v.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "mileage",
      label: "Mileage (km)",
      render: (v: number) => v?.toLocaleString() || "0",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trailers</h1>
          <p className="text-muted-foreground">Manage your trailers</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Trailer
          </button>
        )}
      </div>

      <DataTable
        data={trailers}
        columns={columns}
        loading={loading}
        actions={
          isAdmin
            ? (row: Trailer) => (
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
        title={editingTrailer ? "Edit Trailer" : "Add Trailer"}
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
            <div className="space-y-2">
              <Label>Type <span className="text-destructive">*</span></Label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.type && "border-destructive"
                )}
                placeholder="e.g., Flatbed, Refrigerated"
              />
              {validationErrors.type && (
                <p className="text-xs text-destructive">{validationErrors.type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mileage (km) <span className="text-destructive">*</span></Label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.mileage && "border-destructive"
                )}
              />
              {validationErrors.mileage && (
                <p className="text-xs text-destructive">{validationErrors.mileage}</p>
              )}
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
              {editingTrailer ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Trailer"
        message="Are you sure you want to delete this trailer? This action cannot be undone."
        confirmText="Delete Trailer"
      />
    </div>
  );
}
