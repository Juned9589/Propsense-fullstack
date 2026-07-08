import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    deals: [],
    selected: null,
    loading: false,
    error: null,
};

// --- Async Thunks ---

export const fetchDeals = createAsyncThunk('deal/fetchDeals', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/deals');
        return response.data.deals || response.data; // Backend returns { deals }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
});

export const fetchDealById = createAsyncThunk('deal/fetchDealById', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/deals/${id}`);
        return response.data.deal || response.data; // Backend returns { deal }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal details');
    }
});

export const createDeal = createAsyncThunk('deal/createDeal', async (dealData, { rejectWithValue }) => {
    try {
        const response = await api.post('/deals', dealData);
        return response.data.deal || response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
});

// Renamed to match DealDetail.jsx import: updateDealStatus
export const updateDealStatus = createAsyncThunk('deal/updateDealStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/deals/${id}/status`, { status });
        return response.data.deal || response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update deal status');
    }
});

// Renamed: updateDealOffer. Backend expects { offeredPrice }, not { offerAmount }
export const updateDealOffer = createAsyncThunk('deal/updateDealOffer', async ({ id, offerAmount }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/deals/${id}/offer`, { offeredPrice: offerAmount });
        return response.data.deal || response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update offer');
    }
});

// Renamed: uploadDealDocument. Backend expects field name 'file', not 'document'
export const uploadDealDocument = createAsyncThunk('deal/uploadDealDocument', async ({ id, documentData }, { rejectWithValue }) => {
    try {
        const response = await api.post(`/deals/${id}/documents`, documentData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.deal || response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
});

// Renamed: deleteDealDocument
export const deleteDealDocument = createAsyncThunk('deal/deleteDealDocument', async ({ id, docId }, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/deals/${id}/documents/${docId}`);
        return response.data.deal || response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
});

// Keep old names as aliases for backward compatibility
export const updateStatus = updateDealStatus;
export const updateOffer = updateDealOffer;
export const uploadDocument = uploadDealDocument;
export const deleteDocument = deleteDealDocument;

// --- Slice ---

const dealSlice = createSlice({
    name: 'deal',
    initialState,
    reducers: {
        clearSelectedDeal: (state) => {
            state.selected = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchDeals
            .addCase(fetchDeals.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDeals.fulfilled, (state, action) => { state.loading = false; state.deals = action.payload; })
            .addCase(fetchDeals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            // fetchDealById
            .addCase(fetchDealById.pending, (state) => { state.loading = true; state.error = null; state.selected = null; })
            .addCase(fetchDealById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload; })
            .addCase(fetchDealById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            // createDeal
            .addCase(createDeal.pending, (state) => { state.loading = true; })
            .addCase(createDeal.fulfilled, (state, action) => { state.loading = false; state.deals.push(action.payload); })
            .addCase(createDeal.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            // updateDealStatus
            .addCase(updateDealStatus.pending, (state) => { state.loading = true; })
            .addCase(updateDealStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.deals.findIndex(d => d._id === action.payload._id);
                if (index !== -1) state.deals[index] = action.payload;
                if (state.selected && state.selected._id === action.payload._id) {
                    state.selected = action.payload;
                }
            })
            .addCase(updateDealStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // updateDealOffer
            .addCase(updateDealOffer.pending, (state) => { state.loading = true; })
            .addCase(updateDealOffer.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.deals.findIndex(d => d._id === action.payload._id);
                if (index !== -1) state.deals[index] = action.payload;
                if (state.selected && state.selected._id === action.payload._id) {
                    state.selected = action.payload;
                }
            })
            .addCase(updateDealOffer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // uploadDealDocument
            .addCase(uploadDealDocument.pending, (state) => { state.loading = true; })
            .addCase(uploadDealDocument.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.deals.findIndex(d => d._id === action.payload._id);
                if (index !== -1) state.deals[index] = action.payload;
                if (state.selected && state.selected._id === action.payload._id) {
                    state.selected = action.payload;
                }
            })
            .addCase(uploadDealDocument.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // deleteDealDocument
            .addCase(deleteDealDocument.pending, (state) => { state.loading = true; })
            .addCase(deleteDealDocument.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?._id) {
                    const index = state.deals.findIndex(d => d._id === action.payload._id);
                    if (index !== -1) state.deals[index] = action.payload;
                    if (state.selected && state.selected._id === action.payload._id) {
                        state.selected = action.payload;
                    }
                }
            })
            .addCase(deleteDealDocument.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { clearSelectedDeal } = dealSlice.actions;
export default dealSlice.reducer;
