import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { MaintenanceRule } from "@/lib/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface MaintenanceState {
  items: MaintenanceRule[];
  selectedRule: MaintenanceRule | null;
  loading: boolean;
  error: string | null;
}

const initialState: MaintenanceState = {
  items: [],
  selectedRule: null,
  loading: false,
  error: null,
};

export const fetchMaintenanceRules = createAsyncThunk(
  "maintenance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/maintenance");
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

export const fetchMaintenanceRuleById = createAsyncThunk(
  "maintenance/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/maintenance/${id}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

export const createMaintenanceRule = createAsyncThunk(
  "maintenance/create",
  async (data: Partial<MaintenanceRule>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/maintenance", data);
      toast.success("Règle de maintenance créée avec succès");
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

export const updateMaintenanceRule = createAsyncThunk(
  "maintenance/update",
  async ({ id, data }: { id: string; data: Partial<MaintenanceRule> }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/maintenance/${id}`, data);
      toast.success("Règle de maintenance mise à jour");
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

export const deleteMaintenanceRule = createAsyncThunk(
  "maintenance/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/maintenance/${id}`);
      toast.success("Règle de maintenance supprimée");
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

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearSelectedRule: (state) => {
      state.selectedRule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMaintenanceRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMaintenanceRuleById.fulfilled, (state, action) => {
        state.selectedRule = action.payload;
      })
      .addCase(createMaintenanceRule.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMaintenanceRule.fulfilled, (state, action) => {
        const index = state.items.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteMaintenanceRule.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearSelectedRule, clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
