import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Trailer } from "@/lib/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface TrailersState {
  items: Trailer[];
  selectedTrailer: Trailer | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrailersState = {
  items: [],
  selectedTrailer: null,
  loading: false,
  error: null,
};

export const fetchTrailers = createAsyncThunk("trailers/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/trailers");
    return response.data;
  } catch (err) {
    if (isAxiosError(err)) {
      const message = getErrorMessage(err);
      return rejectWithValue(message);
    }
  }
});

export const fetchTrailerById = createAsyncThunk(
  "trailers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/trailers/${id}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

export const createTrailer = createAsyncThunk(
  "trailers/create",
  async (data: Partial<Trailer>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/trailers", data);
      toast.success("Remorque créée avec succès");
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

export const updateTrailer = createAsyncThunk(
  "trailers/update",
  async ({ id, data }: { id: string; data: Partial<Trailer> }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/trailers/${id}`, data);
      toast.success("Remorque mise à jour avec succès");
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

export const deleteTrailer = createAsyncThunk(
  "trailers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/trailers/${id}`);
      toast.success("Remorque supprimée avec succès");
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

const trailersSlice = createSlice({
  name: "trailers",
  initialState,
  reducers: {
    clearSelectedTrailer: (state) => {
      state.selectedTrailer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrailers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrailers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrailers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrailerById.fulfilled, (state, action) => {
        state.selectedTrailer = action.payload;
      })
      .addCase(createTrailer.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTrailer.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTrailer.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearSelectedTrailer, clearError } = trailersSlice.actions;
export default trailersSlice.reducer;
