import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addPenaltyRunToDb = createAsyncThunk(
    'penaltyRun/addPenaltyRun',
    async (paneltyRunData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/paneltyRun/save', paneltyRunData);
            dispatch(updateToastData({ data: "Penalty run data saved successfully.", type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error.response.data, type: ERROR }));
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
