import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import { addSaveCommentaryLog } from './newsSlice';

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
            // dispatch(addSaveCommentaryLog({ api: "addCommentaryDetails", req: data, res: response?.result }))
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // dispatch(addSaveCommentaryLog({ api: "addCommentaryDetails", req: data, res: error?.message }))
            return rejectWithValue(error?.message);
        }
    }
);
export const addCommentaryScreenData = createAsyncThunk(
    'commentary/addCommentaryScreenData',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveDetails', data);
            // dispatch(addSaveCommentaryLog({ api: "addCommentaryScreenData", req: data, res: response?.result }))
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // dispatch(addSaveCommentaryLog({ api: "addCommentaryScreenData", req: data, res: error?.message }))
            return rejectWithValue(error?.message);
        }
    }
);
export const updateCommentaryDisplayStatus = createAsyncThunk(
    'commentary/updateCommentaryDisplayStatus',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/updateCommentaryStatus', data);
            // dispatch(addSaveCommentaryLog({ api: "updateCommentaryDisplayStatus", req: data, res: response?.result }))
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // dispatch(addSaveCommentaryLog({ api: "updateCommentaryDisplayStatus", req: data, res: error?.message }))
            return rejectWithValue(error?.message);
        }
    }
);
export const changeBowlerFromCommentary = createAsyncThunk(
    'commentary/changeBowlerFromCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/changeBowler', data);
            // dispatch(addSaveCommentaryLog({ api: "changeBowlerFromCommentary", req: data, res: response?.result }))
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // dispatch(addSaveCommentaryLog({ api: "changeBowlerFromCommentary", req: data, res: error?.message }))
            return rejectWithValue(error?.message);
        }
    }
);
export const saveShortCommentary = createAsyncThunk(
    'commentary/saveShortCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveShortCommentary', data);
            // dispatch(addSaveCommentaryLog({ api: "saveShortCommentary", req: data, res: response?.result }))
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            // dispatch(addSaveCommentaryLog({ api: "saveShortCommentary", req: data, res: error?.message }))
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
        isRedirect: undefined
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
        clearLoadingAndError: (state, action) => {
            state.isLoading = undefined
            state.error = undefined
            state.isRedirect = undefined
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
                state.isUndoCompleted = (action.payload?.deleteCommentaryBallByBallId || action.payload?.deleteOverId) ? true : false
                state.isCommentaryDataUpdated = true
                state.isCommentaryBallLoading = false
            })
            .addCase(addCommentaryScreenData.rejected, (state, action) => {
                state.error = action.payload;
                state.isCommentaryBallLoading = false
            })
            .addCase(updateCommentaryDisplayStatus.pending, (state) => {
                state.isCommentaryBallLoading = true;
            })
            .addCase(updateCommentaryDisplayStatus.fulfilled, (state, action) => {
                state.isCommentaryBallLoading = false
            })
            .addCase(updateCommentaryDisplayStatus.rejected, (state, action) => {
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
            .addCase(saveShortCommentary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveShortCommentary.fulfilled, (state, action) => {
                state.isLoading = false
                state.isRedirect = true
            })
            .addCase(saveShortCommentary.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false
            })
    }
});

export const { updateSavedState, clearAddCommentaryScreenData, clearUndoFlag, clearChangeBowler, clearLoadingAndError } = commentarySlice.actions;
export default commentarySlice.reducer;
