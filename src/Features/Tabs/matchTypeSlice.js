import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import { updateToastData } from '../toasterSlice';

export const addMatchTypeToDb = createAsyncThunk(
    'matchType/addMatchType',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/matchType/save', data);
            dispatch(updateToastData({ data: response?.message, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error.message, type: ERROR }));
            return rejectWithValue(error.response.data);
        }
    }
);

const matchTypeSlice = createSlice({
    name: 'matchType',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addMatchTypeToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addMatchTypeToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addMatchTypeToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default matchTypeSlice.reducer;
