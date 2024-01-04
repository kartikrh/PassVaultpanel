import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { transformApiDataToSidebarData, transformPermissionData } from '../../components/Common/Reusables/reusableMethods';
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

export const getTabPermissions = createAsyncThunk(
    'auth/getTabPermissions',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/tabs/getUserWisePermission');
            console.log(response)// Assuming this contains the token
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        tabList: [],
        tabPermissionList: [],
        isLoading: false,
        permissionIsLoading: null,
        error: null,
        permissionError: null
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
            })
            .addCase(getTabPermissions.pending, (state) => {
                state.permissionIsLoading = true;
            })
            .addCase(getTabPermissions.fulfilled, (state, action) => {
                state.tabPermissionList = transformPermissionData(action.payload);
                state.permissionIsLoading = false;
            })
            .addCase(getTabPermissions.rejected, (state, action) => {
                state.permissionIsLoading = false;
                state.permissionError = action.payload;
            });
    }
});

export default authSlice.reducer;
