import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import { updateToastData } from '../toasterSlice';

export const addCompetitionStatisticsToDb = createAsyncThunk(
    'banner/addBanner',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/competitionStatisticsType/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const competitionStatsSlice = createSlice({
    name: 'competitionStatistics',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCompetitionStatisticsToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCompetitionStatisticsToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addCompetitionStatisticsToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState } = competitionStatsSlice.actions;
export default competitionStatsSlice.reducer;
