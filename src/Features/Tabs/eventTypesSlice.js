import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addEventTypeToDb = createAsyncThunk(
    'eventType/addEventType',
    async (eventTypeData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/eventType/save', eventTypeData);
            dispatch(updateToastData({ data: "Event type data saved successfully.", type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error.response.data, type: ERROR }));
            return rejectWithValue(error.response.data);
        }
    }
);

const eventTypeSlice = createSlice({
    name: 'eventType',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addEventTypeToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addEventTypeToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addEventTypeToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default eventTypeSlice.reducer;
