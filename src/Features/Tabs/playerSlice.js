import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addPlayerToDb = createAsyncThunk(
    'player/addPlayer',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/player/save', data);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const playerSlice = createSlice({
    name: 'player',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addPlayerToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addPlayerToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addPlayerToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default playerSlice.reducer;
