"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchTrips, updateTripStatus, downloadTripPdf } from "@/lib/features/trips/tripsSlice";
import { Trip, TripStatus } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import {
  Map,
  Play,
  CheckCircle,
  FileDown,
  Clock,
  MapPin,
  Truck,
  Calendar,
  Fuel,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DriverDashboardPage() {
  const dispatch = useAppDispatch();
  const { items: allTrips, loading } = useAppSelector((state) => state.trips);
  const { user } = useAppSelector((state) => state.auth);

  // Filter trips assigned to current driver (handle both populated and unpopulated driver field)
  const myTrips = allTrips.filter((trip) => {
    const driverId = typeof trip.driver === "object" && trip.driver !== null
      ? (trip.driver as { _id: string })._id
      : trip.driver;
    return driverId === user?._id;
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TripStatus | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [updateFormData, setUpdateFormData] = useState({
    startOdometer: "",
    endOdometer: "",
    fuelConsumedLiters: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  // Stats for driver
  const pendingTrips = myTrips.filter((t) => t.status === "pending");
  const inProgressTrips = myTrips.filter((t) => t.status === "in_progress");
  const completedTrips = myTrips.filter((t) => t.status === "completed");

  const handleStartTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setPendingStatus("in_progress");
    setUpdateFormData({
      startOdometer: trip.startOdometer?.toString() || "",
      endOdometer: "",
      fuelConsumedLiters: "",
      remarks: trip.remarks || "",
    });
    setValidationErrors({});
    setIsUpdateModalOpen(true);
  };

  const handleCompleteTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setPendingStatus("completed");
    setUpdateFormData({
      startOdometer: trip.startOdometer?.toString() || "",
      endOdometer: trip.endOdometer?.toString() || "",
      fuelConsumedLiters: trip.fuelConsumedLiters?.toString() || "",
      remarks: trip.remarks || "",
    });
    setValidationErrors({});
    setIsUpdateModalOpen(true);
  };

  const handleUpdateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !pendingStatus) return;

    const errors: Record<string, string> = {};

    // Validate required fields
    if (pendingStatus === "in_progress") {
      if (!updateFormData.startOdometer) {
        errors.startOdometer = "Le kilométrage de départ est requis";
      }
    }

    if (pendingStatus === "completed") {
      if (!updateFormData.endOdometer) {
        errors.endOdometer = "Le kilométrage d'arrivée est requis";
      }
      if (updateFormData.startOdometer && updateFormData.endOdometer) {
        if (Number(updateFormData.endOdometer) <= Number(updateFormData.startOdometer)) {
          errors.endOdometer = "Le kilométrage d'arrivée doit être supérieur au départ";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

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

    await dispatch(updateTripStatus({ id: selectedTrip._id, status: pendingStatus, data }));
    setIsUpdateModalOpen(false);
    setSelectedTrip(null);
    setPendingStatus(null);
  };

  const handleDownloadPdf = async (tripId: string) => {
    await dispatch(downloadTripPdf(tripId));
  };

  const getStatusBadge = (status: TripStatus) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    const labels = {
      pending: "À faire",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé",
    };
    return (
      <span className={cn("px-3 py-1 text-sm rounded-full border", styles[status])}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mes Trajets</h1>
        <p className="text-muted-foreground">
          Bienvenue {user?.name} - Gérez vos trajets assignés
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">À faire</p>
              <p className="text-2xl font-bold">{pendingTrips.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Play className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En cours</p>
              <p className="text-2xl font-bold">{inProgressTrips.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Terminés</p>
              <p className="text-2xl font-bold">{completedTrips.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Trips - Priority Section */}
      {inProgressTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-500" />
            Trajet en cours
          </h2>
          {inProgressTrips.map((trip) => (
            <div
              key={trip._id}
              className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{trip.reference}</span>
                    {getStatusBadge(trip.status)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {trip.origin} → {trip.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(trip.plannedStart).toLocaleDateString("fr-FR")}
                    </span>
                    {trip.startOdometer && (
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Départ: {trip.startOdometer.toLocaleString()} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPdf(trip._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleCompleteTrip(trip)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Terminer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Trips */}
      {pendingTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Trajets à faire
          </h2>
          <div className="grid gap-4">
            {pendingTrips.map((trip) => (
              <div
                key={trip._id}
                className="p-6 bg-card rounded-xl border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{trip.reference}</span>
                      {getStatusBadge(trip.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trip.origin} → {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Prévu: {new Date(trip.plannedStart).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPdf(trip._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <FileDown className="h-4 w-4" />
                      Ordre de mission
                    </button>
                    <button
                      onClick={() => handleStartTrip(trip)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4" />
                      Démarrer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Trajets terminés
          </h2>
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Trajet</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Distance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Gasoil</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completedTrips.slice(0, 10).map((trip) => (
                  <tr key={trip._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{trip.reference}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {trip.origin} → {trip.destination}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {trip.startOdometer && trip.endOdometer
                        ? `${(trip.endOdometer - trip.startOdometer).toLocaleString()} km`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {trip.fuelConsumedLiters ? `${trip.fuelConsumedLiters} L` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadPdf(trip._id)}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="Télécharger PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {myTrips.length === 0 && (
        <div className="text-center py-12">
          <Map className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Aucun trajet assigné</h3>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas encore de trajets assignés.
          </p>
        </div>
      )}

      {/* Update Trip Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTrip(null);
          setPendingStatus(null);
        }}
        title={pendingStatus === "in_progress" ? "Démarrer le trajet" : "Terminer le trajet"}
      >
        <form onSubmit={handleUpdateFormSubmit} className="space-y-4">
          {selectedTrip && (
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <p className="font-medium">{selectedTrip.reference}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTrip.origin} → {selectedTrip.destination}
              </p>
            </div>
          )}

          {/* Start Odometer - Required when starting */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kilométrage départ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={updateFormData.startOdometer}
                onChange={(e) =>
                  setUpdateFormData({ ...updateFormData, startOdometer: e.target.value })
                }
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-lg",
                  validationErrors.startOdometer && "border-red-500"
                )}
                placeholder="Ex: 125000"
                disabled={pendingStatus === "completed" && !!selectedTrip?.startOdometer}
              />
            </div>
            {validationErrors.startOdometer && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.startOdometer}</p>
            )}
          </div>

          {/* End Odometer - Required when completing */}
          {pendingStatus === "completed" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Kilométrage arrivée <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={updateFormData.endOdometer}
                  onChange={(e) =>
                    setUpdateFormData({ ...updateFormData, endOdometer: e.target.value })
                  }
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border rounded-lg",
                    validationErrors.endOdometer && "border-red-500"
                  )}
                  placeholder="Ex: 125500"
                />
              </div>
              {validationErrors.endOdometer && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endOdometer}</p>
              )}
            </div>
          )}

          {/* Fuel Consumed - Optional */}
          {pendingStatus === "completed" && (
            <div>
              <label className="block text-sm font-medium mb-1">Volume gasoil (litres)</label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.1"
                  value={updateFormData.fuelConsumedLiters}
                  onChange={(e) =>
                    setUpdateFormData({ ...updateFormData, fuelConsumedLiters: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  placeholder="Ex: 45.5"
                />
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Remarques (état du véhicule, incidents...)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                value={updateFormData.remarks}
                onChange={(e) =>
                  setUpdateFormData({ ...updateFormData, remarks: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg min-h-[100px]"
                placeholder="Notez ici toute remarque concernant le véhicule ou le trajet..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setSelectedTrip(null);
                setPendingStatus(null);
              }}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 px-4 py-2 text-white rounded-lg",
                pendingStatus === "in_progress"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {pendingStatus === "in_progress" ? "Démarrer" : "Terminer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
