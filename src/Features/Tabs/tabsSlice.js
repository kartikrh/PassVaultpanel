import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addTabToDb = createAsyncThunk(
    'tab/addTab',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/tabs/save', userData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const tabSlice = createSlice({
    name: 'tab',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addTabToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addTabToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addTabToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default tabSlice.reducer;
