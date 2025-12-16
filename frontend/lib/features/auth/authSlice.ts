import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

// Define the shape of our auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state when app starts
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Login action - call API to login user
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Call login endpoint
      const response = await api.post("/api/auth/login", credentials);
      
      // Save token and user to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Show success message
      toast.success("Login successful!");
      
      return response.data;
    } catch (err) {
      // Get error message and show it
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  }
);

// Logout action - clear user data
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint
      await api.post("/api/auth/logout");
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      toast.success("Logged out successfully");
      return null;
    } catch (err) {
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

// Check if user is already logged in (on app start)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Get user data from API
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (err) {
      // If error, user is not logged in
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (isAxiosError(err)) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear any error messages
    clearError: (state) => {
      state.error = null;
    },
    // Manually set user (useful for updating profile)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle login actions
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Handle logout actions
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

    // Handle checkAuth actions
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Export actions
export const { clearError, setUser } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
