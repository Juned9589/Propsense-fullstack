import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Uses our configured Axios instance

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
};

// --- Async Thunks ---

// POST /api/auth/login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data; // Expected to return { user, token }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// POST /api/auth/register
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data; // Expected to return { user, token }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// GET /api/auth/me
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data; // Expected to return { user }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
        }
    }
);

// PUT /api/auth/preferences
export const savePreferences = createAsyncThunk(
    'auth/savePreferences',
    async (preferences, { rejectWithValue }) => {
        try {
            const response = await api.put('/auth/preferences', preferences);
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save preferences');
        }
    }
);

// --- Auth Slice ---

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            if (token) {
                localStorage.setItem('token', token);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            // Login Cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Register Cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Me Cases
            .addCase(getMe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || action.payload; // Fallback based on typical API responses
            })
            .addCase(getMe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Save Preferences Cases
            .addCase(savePreferences.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(savePreferences.fulfilled, (state, action) => {
                state.loading = false;
                // Update user preferences in state (assuming API returns the updated preferences or user)
                if (state.user) {
                    state.user.preferences = action.payload.preferences || action.payload;
                }
            })
            .addCase(savePreferences.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
