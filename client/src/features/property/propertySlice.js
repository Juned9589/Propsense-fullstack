import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    properties: [],
    featured: [],
    favorites: [],
    favoriteIds: [], // tracks just the IDs of favorited properties for instant UI updates
    myListings: [],
    selected: null,
    total: 0,
    page: 1,
    loading: false,
    error: null,
};

// --- Async Thunks ---

// GET /api/properties (with filters)
export const fetchProperties = createAsyncThunk(
    'property/fetchProperties',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/properties${params ? `?${params}` : ''}`);
            return response.data; // Expected: { properties: [...], total: X, page: Y }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
        }
    }
);

// GET /api/properties/featured
export const fetchFeatured = createAsyncThunk(
    'property/fetchFeatured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/properties/featured');
            return response.data.properties || response.data; // Backend returns { properties }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
        }
    }
);

// GET /api/properties/favorites
export const fetchFavorites = createAsyncThunk(
    'property/fetchFavorites',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/properties/favorites');
            return response.data.favorites || response.data; // Backend returns { favorites }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorite properties');
        }
    }
);

// GET /api/properties/agent/my
export const fetchMyListings = createAsyncThunk(
    'property/fetchMyListings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/properties/agent/my');
            return response.data.properties || response.data; // Backend returns { properties }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your listings');
        }
    }
);

// GET /api/properties/:id
export const fetchPropertyById = createAsyncThunk(
    'property/fetchPropertyById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/properties/${id}`);
            return response.data.property || response.data; // Backend returns { property }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
        }
    }
);

// POST /api/properties/
export const createProperty = createAsyncThunk(
    'property/createProperty',
    async (propertyData, { rejectWithValue }) => {
        try {
            const response = await api.post('/properties', propertyData);
            return response.data.property || response.data; // Backend returns { property }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create property');
        }
    }
);

// PUT /api/properties/:id
export const updateProperty = createAsyncThunk(
    'property/updateProperty',
    async ({ id, propertyData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/properties/${id}`, propertyData);
            return response.data.property || response.data; // Backend returns { property }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update property');
        }
    }
);

// DELETE /api/properties/:id
export const deleteProperty = createAsyncThunk(
    'property/deleteProperty',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/properties/${id}`);
            return id; // Return the ID so it can be filtered out of the state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
        }
    }
);

// POST /api/properties/:id/favorite
export const toggleFavorite = createAsyncThunk(
    'property/toggleFavorite',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/properties/${id}/favorite`);
            return { id, favorited: response.data.favorited }; // { id, favorited: true/false }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
        }
    }
);

// POST /api/properties/:id/contact
export const contactAgent = createAsyncThunk(
    'property/contactAgent',
    async ({ id, messageData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/properties/${id}/contact`, messageData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

// --- Property Slice ---

const propertySlice = createSlice({
    name: 'property',
    initialState,
    reducers: {
        clearSelectedProperty: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchProperties
            .addCase(fetchProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.properties = action.payload.properties || action.payload;
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchFeatured
            .addCase(fetchFeatured.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeatured.fulfilled, (state, action) => {
                state.loading = false;
                state.featured = action.payload;
            })
            .addCase(fetchFeatured.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchFavorites
            .addCase(fetchFavorites.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.loading = false;
                state.favorites = action.payload;
                // Sync favoriteIds from the fetched favorites list
                state.favoriteIds = action.payload.map(p => p._id || p);
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchMyListings
            .addCase(fetchMyListings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyListings.fulfilled, (state, action) => {
                state.loading = false;
                state.myListings = action.payload;
            })
            .addCase(fetchMyListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchPropertyById
            .addCase(fetchPropertyById.pending, (state) => {
                state.loading = true;
                state.selected = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload;
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // createProperty
            .addCase(createProperty.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProperty.fulfilled, (state, action) => {
                state.loading = false;
                state.myListings.push(action.payload);
            })
            .addCase(createProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // updateProperty
            .addCase(updateProperty.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProperty.fulfilled, (state, action) => {
                state.loading = false;
                // Update in myListings
                const index = state.myListings.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.myListings[index] = action.payload;
                }
                // Update in selected
                if (state.selected && state.selected._id === action.payload._id) {
                    state.selected = action.payload;
                }
            })
            .addCase(updateProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // deleteProperty
            .addCase(deleteProperty.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProperty.fulfilled, (state, action) => {
                state.loading = false;
                state.myListings = state.myListings.filter(p => p._id !== action.payload);
                if (state.selected && state.selected._id === action.payload) {
                    state.selected = null;
                }
            })
            .addCase(deleteProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // toggleFavorite — update favoriteIds and favorites list instantly
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                const { id, favorited } = action.payload;
                if (favorited) {
                    // Add to favoriteIds if not already there
                    if (!state.favoriteIds.includes(id)) {
                        state.favoriteIds.push(id);
                    }
                } else {
                    // Remove from favoriteIds and favorites list
                    state.favoriteIds = state.favoriteIds.filter(fid => fid !== id);
                    state.favorites = state.favorites.filter(p => (p._id || p) !== id);
                }
            })

            // contactAgent
            .addCase(contactAgent.pending, (state) => {
                state.loading = true;
            })
            .addCase(contactAgent.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(contactAgent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;
