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
        const startTime = performance.now(); // Start timing
        try {
            const response = await axiosInstance.post('/admin/commentary/saveDetails', data);
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            // dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            // dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const undoBallFromCommentary = createAsyncThunk(
    'commentary/undoBallFromCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        const startTime = performance.now(); // Start timing
        try {
            const response = await axiosInstance.post('/admin/commentary/deleteBallByBall', data);
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            // dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            // dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const undoOverFromCommentary = createAsyncThunk(
    'commentary/undoOverFromCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        const startTime = performance.now(); // Start timing
        try {
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            const response = await axiosInstance.post('/admin/commentary/deleteOverCommentary', data);
            // dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            const endTime = performance.now(); // End timing
            console.log(`addCommentaryToDb API call failed after ${endTime - startTime} milliseconds.`);
            // dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const changeBowlerFromCommentary = createAsyncThunk(
    'commentary/changeBowlerFromCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/changeBowler', data);
            // dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            console.log(response?.result)
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
        isCommentaryDataUpdated: undefined,
        isUndoCompleted: undefined,
        isBowlerChanged: undefined,
        isCommentaryBallLoading: undefined,
    },
    reducers: {
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        },
        clearAddCommentaryScreenData: (state, action) => {
            state.commentaryDataToUpdate = {}
            state.isCommentaryDataUpdated = undefined
        },
        clearUndoFlag: (state, action) => {
            state.isUndoCompleted = undefined
        },
        clearChangeBowler: (state, action) => {
            state.isBowlerChanged = undefined
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
                state.isCommentaryBallLoading = true;
            })
            .addCase(addCommentaryScreenData.fulfilled, (state, action) => {
                state.commentaryDataToUpdate = action.payload
                state.isCommentaryDataUpdated = true
                state.isCommentaryBallLoading = false
            })
            .addCase(addCommentaryScreenData.rejected, (state, action) => {
                state.error = action.payload;
                state.isCommentaryBallLoading = false
            })
            .addCase(undoBallFromCommentary.pending, (state) => {
                state.isCommentaryBallLoading = true;
            })
            .addCase(undoBallFromCommentary.fulfilled, (state, action) => {
                state.isUndoCompleted = true
                state.isCommentaryBallLoading = false
            })
            .addCase(undoBallFromCommentary.rejected, (state, action) => {
                state.error = action.payload;
                state.isCommentaryBallLoading = false
            })
            .addCase(changeBowlerFromCommentary.pending, (state) => {
                state.isCommentaryBallLoading = true;
            })
            .addCase(changeBowlerFromCommentary.fulfilled, (state, action) => {
                state.isBowlerChanged = true
                state.isCommentaryBallLoading = false
            })
            .addCase(changeBowlerFromCommentary.rejected, (state, action) => {
                state.error = action.payload;
                state.isCommentaryBallLoading = false
            })
    }
});

export const { updateSavedState, clearAddCommentaryScreenData, clearUndoFlag, clearChangeBowler } = commentarySlice.actions;
export default commentarySlice.reducer;
