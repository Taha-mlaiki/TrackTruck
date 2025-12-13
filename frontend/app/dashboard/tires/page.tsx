"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchTires,
  createTire,
  updateTire,
  deleteTire,
} from "@/lib/features/tires/tiresSlice";
import { Tire } from "@/lib/types";
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
import { createTireSchema, validateForm, ValidationErrors } from "@/lib/validations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function TiresPage() {
  const dispatch = useAppDispatch();
  const { items: tires, loading } = useAppSelector((state) => state.tires);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTire, setEditingTire] = useState<Tire | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    serialNumber: "",
    wearLevel: "",
    status: "new" as "new" | "in_use" | "worn_out",
    position: "",
  });

  useEffect(() => {
    dispatch(fetchTires());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingTire(null);
    setValidationErrors({});
    setFormData({
      serialNumber: "",
      wearLevel: "",
      status: "new",
      position: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tire: Tire) => {
    setEditingTire(tire);
    setValidationErrors({});
    setFormData({
      serialNumber: tire.serialNumber,
      wearLevel: tire.wearLevel.toString(),
      status: tire.status,
      position: tire.position || "",
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

    const validation = validateForm(createTireSchema, formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const data = {
      serialNumber: formData.serialNumber,
      wearLevel: parseInt(formData.wearLevel) || 0,
      status: formData.status,
      position: formData.position || undefined,
    };

    if (editingTire) {
      await dispatch(updateTire({ id: editingTire._id, data }));
    } else {
      await dispatch(createTire(data));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteTire(deleteId));
      setDeleteId(null);
    }
  };

  const columns = [
    { key: "serialNumber", label: "Serial Number" },
    {
      key: "wearLevel",
      label: "Wear Level",
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${
                v < 30 ? "bg-green-500" : v < 70 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${v}%` }}
            />
          </div>
          <span className="text-sm">{v}%</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: string) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            v === "new"
              ? "bg-green-100 text-green-700"
              : v === "in_use"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {v.replace("_", " ")}
        </span>
      ),
    },
    { key: "position", label: "Position" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tires</h1>
          <p className="text-muted-foreground">Manage your tires inventory</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Tire
          </button>
        )}
      </div>

      <DataTable
        data={tires}
        columns={columns}
        loading={loading}
        actions={
          isAdmin
            ? (row: Tire) => (
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
        title={editingTire ? "Edit Tire" : "Add Tire"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Serial Number <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  validationErrors.serialNumber ? "border-destructive" : ""
                }`}
              />
              {validationErrors.serialNumber && (
                <p className="text-xs text-destructive">{validationErrors.serialNumber}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="e.g., Front Left"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Wear Level (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.wearLevel}
                onChange={(e) => handleInputChange("wearLevel", e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  validationErrors.wearLevel && "border-destructive"
                )}
              />
              {validationErrors.wearLevel && (
                <p className="text-xs text-destructive">{validationErrors.wearLevel}</p>
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="worn_out">Worn Out</SelectItem>
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
              {editingTire ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Tire"
        message="Are you sure you want to delete this tire? This action cannot be undone."
        confirmText="Delete Tire"
      />
    </div>
  );
}
