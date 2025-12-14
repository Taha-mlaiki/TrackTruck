import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { Trip, TripStatus } from "@/lib/types";
import { toast } from "sonner";

// Define the shape of our trips state
interface TripsState {
  items: Trip[]; // List of all trips
  loading: boolean; // Loading indicator
  error: string | null; // Error message if any
}

// Initial state
const initialState: TripsState = {
  items: [],
  loading: false,
  error: null,
};

// Get all trips from API
export const fetchTrips = createAsyncThunk(
  "trips/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/trips");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Create a new trip
export const createTrip = createAsyncThunk(
  "trips/create",
  async (tripData: Partial<Trip>, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/trips", tripData);
      toast.success("Trip created successfully!");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update trip status (pending -> in_progress -> completed)
export const updateTripStatus = createAsyncThunk(
  "trips/updateStatus",
  async (
    { id, status, data }: { id: string; status: TripStatus; data?: Partial<Trip> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/trips/${id}/status`, { status, ...data });
      toast.success("Trip status updated!");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Download trip PDF
export const downloadTripPdf = createAsyncThunk(
  "trips/downloadPdf",
  async (id: string, { rejectWithValue }) => {
    try {
      // Get PDF from API
      const response = await api.get(`/api/trips/${id}/pdf`, { responseType: "blob" });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `trip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("PDF downloaded successfully!");
      return id;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Create the slice
const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchTrips
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Replace all trips with new data
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle createTrip
    builder
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.push(action.payload); // Add new trip to list
      })

    // Handle updateTripStatus
    builder
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        // Find and update the trip in the list
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

// Export actions
export const { clearError } = tripsSlice.actions;

// Export reducer
export default tripsSlice.reducer;
