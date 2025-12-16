import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Fuel, FuelStats } from "@/lib/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface FuelState {
  items: Fuel[];
  stats: FuelStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: FuelState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
};

export const fetchFuelRecords = createAsyncThunk(
  "fuel/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/fuel");
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

export const createFuelRecord = createAsyncThunk(
  "fuel/create",
  async (data: Partial<Fuel>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/fuel", data);
      toast.success("Enregistrement carburant créé avec succès");
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  }
);

export const updateFuelRecord = createAsyncThunk(
  "fuel/update",
  async ({ id, data }: { id: string; data: Partial<Fuel> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/fuel/${id}`, data);
      toast.success("Enregistrement carburant mis à jour");
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  }
);

export const deleteFuelRecord = createAsyncThunk(
  "fuel/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/fuel/${id}`);
      toast.success("Enregistrement carburant supprimé");
      return id;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  }
);

export const fetchFuelStats = createAsyncThunk(
  "fuel/fetchStats",
  async (params: { truckId?: string; startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.truckId) queryParams.append("truckId", params.truckId);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      
      const response = await api.get(`/api/fuel/stats?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

const fuelSlice = createSlice({
  name: "fuel",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchFuelRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFuelRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFuelRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createFuelRecord.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateFuelRecord.fulfilled, (state, action) => {
        const idx = state.items.findIndex((f) => f._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // Delete
      .addCase(deleteFuelRecord.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f._id !== action.payload);
      })
      // Stats
      .addCase(fetchFuelStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = fuelSlice.actions;
export default fuelSlice.reducer;
