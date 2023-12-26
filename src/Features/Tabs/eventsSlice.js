import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addEventToDb = createAsyncThunk(
    'events/addEvent',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/events/save', userData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addEventToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addEventToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addEventToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default eventSlice.reducer;
