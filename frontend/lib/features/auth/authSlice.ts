import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { User } from "@/lib/types";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkingAuth: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  checkingAuth: true, // Start as true to prevent flash of login page
  error: null,
};

// Check if user is authenticated on app load
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (err) {
      const error = err as { response?: { status?: number } };
      // If 401, try to refresh the token
      if (error.response?.status === 401) {
        try {
          await api.post("/api/auth/refresh");
          // Retry getting user after refresh
          const retryResponse = await api.get("/api/auth/me");
          return retryResponse.data;
        } catch {
          return rejectWithValue("Session expirée");
        }
      }
      const message = getErrorMessage(err);
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      toast.success("Connexion réussie");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout");
    return null;
  } catch (err) {
    const message = getErrorMessage(err);
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkingAuth = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login
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
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
