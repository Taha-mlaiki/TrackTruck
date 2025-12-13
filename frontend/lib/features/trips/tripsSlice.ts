import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Trip, TripStatus } from "@/lib/types";
import { toast } from "sonner";

interface TripsState {
  items: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  items: [],
  selectedTrip: null,
  loading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk("trips/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/trips");
    return response.data;
  } catch (err) {
    const message = getErrorMessage(err);
    return rejectWithValue(message);
  }
});

export const createTrip = createAsyncThunk(
  "trips/create",
  async (data: Partial<Trip>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/trips", data);
      toast.success("Trajet créé avec succès");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTripStatus = createAsyncThunk(
  "trips/updateStatus",
  async (
    { id, status, data }: { id: string; status: TripStatus; data?: Partial<Trip> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/trips/${id}/status`, { status, ...data });
      toast.success("Statut du trajet mis à jour");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const downloadTripPdf = createAsyncThunk(
  "trips/downloadPdf",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/trips/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF téléchargé avec succès");
      return id;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { clearSelectedTrip, clearError } = tripsSlice.actions;
export default tripsSlice.reducer;
