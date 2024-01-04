import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';


export const addEventToDb = createAsyncThunk(
    'events/addEvent',
    async (userData, { rejectWithValue,dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/events/save', userData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
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
