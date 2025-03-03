import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const configInit = createAsyncThunk(
    '/loadInit',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/loadInitData", { isActive: true });
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

const loadInitSlice = createSlice({
    name: 'loadInit',
    initialState: {
        loadInitData: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        resetLoadInitSlice: (state) => {
            state.loadInitData = [];
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(configInit.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(configInit.fulfilled, (state, action) => {
                state.loadInitData = action.payload;
                state.isLoading = false;
            })
            .addCase(configInit.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetLoadInitSlice } = loadInitSlice.actions;
export default loadInitSlice.reducer;