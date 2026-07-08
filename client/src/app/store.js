import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import propertyReducer from '../features/property/propertySlice';
import dealReducer from '../features/deal/dealSlice';
import notificationReducer from '../features/notification/notificationSlice';

const appReducer = combineReducers({
    auth: authReducer,
    property: propertyReducer,
    deal: dealReducer,
    notification: notificationReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/logout') {
        // This resets all slices to their initialState
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
});

export default store;
