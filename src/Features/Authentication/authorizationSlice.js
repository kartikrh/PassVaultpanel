import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { transformApiDataToSidebarData } from '../../components/Common/Reusables/reusableMethods';
import axiosInstance from '../axios';

export const getAuthorisedTabs = createAsyncThunk(
    'auth/getTabs',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/tabs/all');
            return response?.result; // Assuming this contains the token

        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

// Slice for login
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        tabList: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAuthorisedTabs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAuthorisedTabs.fulfilled, (state, action) => {
                state.tabList = transformApiDataToSidebarData(action.payload);
                state.isLoading = false;
            })
            .addCase(getAuthorisedTabs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default authSlice.reducer;
