import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addRoleToDb = createAsyncThunk(
    'role/addPenaltyRun',
    async (roleData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/roles/create', roleData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const penaltyRunSlice = createSlice({
    name: 'role',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addRoleToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addRoleToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addRoleToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default penaltyRunSlice.reducer;
