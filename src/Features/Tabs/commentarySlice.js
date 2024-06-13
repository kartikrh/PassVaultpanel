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
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const updateCommentaryDisplayStatus = createAsyncThunk(
    'commentary/updateCommentaryDisplayStatus',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/updateCommentaryStatus', data);
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const changeBowlerFromCommentary = createAsyncThunk(
    'commentary/changeBowlerFromCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/changeBowler', data);
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const saveShortCommentary = createAsyncThunk(
    'commentary/saveShortCommentary',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveShortCommentary', data);
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const deleteCommentaryFeatures = createAsyncThunk(
    'commentary/deleteCommentaryFeatures',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/deleteCommentaryDetails', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const saveCommentaryFeatures = createAsyncThunk(
    'commentary/saveCommentaryFeatures',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/saveCommentaryDetails', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const loadCommentaryFeature = createAsyncThunk(
    'commentary/loadCommentaryFeature',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/loadcommentaryapi', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

export const addSuperOverCall = createAsyncThunk(
    'commentary/superOverCall',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/addSuperOver', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
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
        isRedirect: undefined,
        superOverApiData: undefined
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
            state.superOverApiData = undefined
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
            .addCase(saveCommentaryFeatures.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveCommentaryFeatures.fulfilled, (state, action) => {
                state.isLoading = false
                state.isRedirect = true
            })
            .addCase(saveCommentaryFeatures.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false
            })
            .addCase(deleteCommentaryFeatures.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCommentaryFeatures.fulfilled, (state, action) => {
                state.isLoading = false
                state.isRedirect = true
            })
            .addCase(deleteCommentaryFeatures.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false
            })
            .addCase(loadCommentaryFeature.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadCommentaryFeature.fulfilled, (state, action) => {
                state.isLoading = false
            })
            .addCase(loadCommentaryFeature.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false
            })
            .addCase(addSuperOverCall.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addSuperOverCall.fulfilled, (state, action) => {
                state.isLoading = false
                state.superOverApiData = action.payload
            })
            .addCase(addSuperOverCall.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false
                state.superOverApiData = false
            })
    }
});

export const { updateSavedState, clearAddCommentaryScreenData, clearUndoFlag, clearChangeBowler, clearLoadingAndError } = commentarySlice.actions;
export default commentarySlice.reducer;
