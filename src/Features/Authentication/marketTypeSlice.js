import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const getMarketType = createAsyncThunk(
    'marketType/getMarketType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/marketType');
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response);
        }
    }
);

const marketTypeSlice = createSlice({
    name: 'marketType',
    initialState: {
        marketTypeList: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        resetMarketTypeSlice: (state) => {
            state.marketTypeList = [];
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMarketType.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMarketType.fulfilled, (state, action) => {
                state.marketTypeList = action.payload;
                state.isLoading = false;
            })
            .addCase(getMarketType.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetMarketTypeSlice } = marketTypeSlice.actions;
export default marketTypeSlice.reducer;