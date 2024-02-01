import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addPageFormatToDB = createAsyncThunk(
    'pageFormat/addPageFormat',
    async (pageFormatData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/pageFormate/save', pageFormatData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const pageFormatSlice = createSlice({
    name: 'pageFormat',
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
            .addCase(addPageFormatToDB.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addPageFormatToDB.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addPageFormatToDB.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState } = pageFormatSlice.actions;
export default pageFormatSlice.reducer;
