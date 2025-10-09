import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';
export const addEntitySocketToDb = createAsyncThunk(
    'entitySocket/addEntitySocket',
    async (entitySocketData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/entitySocket/save', entitySocketData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const entitySocketSlice = createSlice({
    name: 'entitySocket',
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
            .addCase(addEntitySocketToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addEntitySocketToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addEntitySocketToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState } = entitySocketSlice.actions;
export default entitySocketSlice.reducer;
