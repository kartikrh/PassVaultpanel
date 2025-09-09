import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addIccRankingToDb = createAsyncThunk(
    'iccRanking/addIccRanking',
    async (rankingData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/iccRanking/save', rankingData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const ICCRankingSlice = createSlice({
    name: 'Icc Ranking',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addIccRankingToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addIccRankingToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addIccRankingToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState } = ICCRankingSlice.actions;
export default ICCRankingSlice.reducer;
