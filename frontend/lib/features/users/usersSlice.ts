import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "@/lib/api";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface UsersState {
  items: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/users");
    return response.data;
  } catch (err) {
    if(isAxiosError(err) ) {
      const message = getErrorMessage(err);
      return rejectWithValue(message);
    }
  }
});

export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    }  catch (err) {
      if(isAxiosError(err) ) {
        const message = getErrorMessage(err);
        return rejectWithValue(message);
      }
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (data: Partial<User> & { password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users", data);
      toast.success("Utilisateur créé avec succès");
      return response.data;
    }  catch (err) {
      if(isAxiosError(err) ) {
        const message = getErrorMessage(err);
        toast.error(message);
        return rejectWithValue(message);
      }
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${id}`, data);
      toast.success("Utilisateur mis à jour avec succès");
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

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/users/${id}`);
      toast.success("Utilisateur supprimé avec succès");
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

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u._id !== action.payload);
      });
  },
});

export const { clearSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
