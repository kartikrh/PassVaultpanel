import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addCommentaryToDb = createAsyncThunk(
    'commentary/addCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const addCommentaryDetailsToDb = createAsyncThunk(
    'commentary/addCommentaryDetails',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveDetails', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const addCommentaryScreenData = createAsyncThunk(
    'commentary/addCommentaryScreenData',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveDetails', data);
            // dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            // dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
const commentarySlice = createSlice({
    name: 'commentary',
    initialState: {
        commentaryDataToUpdate: {},
        isSaved: undefined,
        isLoading: false,
        error: null,
        isCommentaryDataUpdated: undefined
    },
    reducers: {
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        },
        clearAddCommentaryScreenData: (state, action) => {
            state.commentaryDataToUpdate = {}
            state.isCommentaryDataUpdated = undefined
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCommentaryToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCommentaryToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addCommentaryToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(addCommentaryDetailsToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCommentaryDetailsToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addCommentaryDetailsToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(addCommentaryScreenData.pending, (state) => {
                // state.isLoading = true;
            })
            .addCase(addCommentaryScreenData.fulfilled, (state, action) => {
                state.commentaryDataToUpdate = action.payload
                state.isCommentaryDataUpdated = true
                // state.isSaved = true
                // state.isLoading = false;
            })
            .addCase(addCommentaryScreenData.rejected, (state, action) => {
                // state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState, clearAddCommentaryScreenData } = commentarySlice.actions;
export default commentarySlice.reducer;
