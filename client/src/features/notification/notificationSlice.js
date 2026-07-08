import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

// --- Async Thunks ---

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/notifications');
        return response.data; // Backend returns { notifications, unreadCount }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data.notification || response.data; // Backend returns { notification }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
});

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async (_, { rejectWithValue }) => {
    try {
        const response = await api.put('/notifications/read-all');
        return response.data; // Expected to return success status
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
});

export const deleteNotification = createAsyncThunk('notification/deleteNotification', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/notifications/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
});

// --- Slice ---

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications || action.payload;
                state.unreadCount = action.payload.unreadCount ?? state.notifications.filter(n => !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            // markAsRead
            .addCase(markAsRead.pending, (state) => { state.loading = true; })
            .addCase(markAsRead.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.notifications.findIndex(n => n._id === action.payload._id);
                if (index !== -1) {
                    if (!state.notifications[index].read && action.payload.read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.notifications[index] = action.payload;
                }
            })
            .addCase(markAsRead.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // markAllAsRead
            .addCase(markAllAsRead.pending, (state) => { state.loading = true; })
            .addCase(markAllAsRead.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.notifications) {
                    state.notifications = action.payload.notifications;
                    state.unreadCount = action.payload.unreadCount;
                } else {
                    // Fallback for old API response
                    state.notifications = state.notifications.map(n => ({ ...n, read: true }));
                    state.unreadCount = 0;
                }
            })
            .addCase(markAllAsRead.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // deleteNotification
            .addCase(deleteNotification.pending, (state) => { state.loading = true; })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.notifications.findIndex(n => n._id === action.payload);
                if (index !== -1) {
                    if (!state.notifications[index].read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.notifications.splice(index, 1);
                }
            })
            .addCase(deleteNotification.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
