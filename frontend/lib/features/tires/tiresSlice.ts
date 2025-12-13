import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Tire } from "@/lib/types";
import { toast } from "sonner";

interface TiresState {
  items: Tire[];
  selectedTire: Tire | null;
  loading: boolean;
  error: string | null;
}

const initialState: TiresState = {
  items: [],
  selectedTire: null,
  loading: false,
  error: null,
};

export const fetchTires = createAsyncThunk("tires/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/tires");
    return response.data;
  } catch (err) {
    const message = getErrorMessage(err);
    return rejectWithValue(message);
  }
});

export const fetchTireById = createAsyncThunk(
  "tires/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/tires/${id}`);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      return rejectWithValue(message);
    }
  }
);

export const createTire = createAsyncThunk(
  "tires/create",
  async (data: Partial<Tire>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/tires", data);
      toast.success("Pneu créé avec succès");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTire = createAsyncThunk(
  "tires/update",
  async ({ id, data }: { id: string; data: Partial<Tire> }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/tires/${id}`, data);
      toast.success("Pneu mis à jour avec succès");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTire = createAsyncThunk(
  "tires/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tires/${id}`);
      toast.success("Pneu supprimé avec succès");
      return id;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const tiresSlice = createSlice({
  name: "tires",
  initialState,
  reducers: {
    clearSelectedTire: (state) => {
      state.selectedTire = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTires.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTires.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTires.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTireById.fulfilled, (state, action) => {
        state.selectedTire = action.payload;
      })
      .addCase(createTire.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTire.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTire.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearSelectedTire, clearError } = tiresSlice.actions;
export default tiresSlice.reducer;
