import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Truck } from "@/lib/types";
import { toast } from "sonner";

interface TrucksState {
  items: Truck[];
  selectedTruck: Truck | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrucksState = {
  items: [],
  selectedTruck: null,
  loading: false,
  error: null,
};

export const fetchTrucks = createAsyncThunk("trucks/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/trucks");
    return response.data;
  } catch (err) {
    const message = getErrorMessage(err);
    return rejectWithValue(message);
  }
});

export const fetchTruckById = createAsyncThunk(
  "trucks/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/trucks/${id}`);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      return rejectWithValue(message);
    }
  }
);

export const createTruck = createAsyncThunk(
  "trucks/create",
  async (data: Partial<Truck>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/trucks", data);
      toast.success("Camion créé avec succès");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTruck = createAsyncThunk(
  "trucks/update",
  async ({ id, data }: { id: string; data: Partial<Truck> }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/trucks/${id}`, data);
      toast.success("Camion mis à jour avec succès");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTruck = createAsyncThunk(
  "trucks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/trucks/${id}`);
      toast.success("Camion supprimé avec succès");
      return id;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const trucksSlice = createSlice({
  name: "trucks",
  initialState,
  reducers: {
    clearSelectedTruck: (state) => {
      state.selectedTruck = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrucks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrucks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrucks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTruckById.fulfilled, (state, action) => {
        state.selectedTruck = action.payload;
      })
      .addCase(createTruck.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTruck.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTruck.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearSelectedTruck, clearError } = trucksSlice.actions;
export default trucksSlice.reducer;
