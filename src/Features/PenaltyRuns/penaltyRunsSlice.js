import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addPenaltyRunToDb = createAsyncThunk(
    'penaltyRun/addPenaltyRun',
    async (paneltyRunData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/paneltyRun/save', paneltyRunData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const penaltyRunSlice = createSlice({
    name: 'penaltyRun',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addPenaltyRunToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addPenaltyRunToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addPenaltyRunToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default penaltyRunSlice.reducer;
