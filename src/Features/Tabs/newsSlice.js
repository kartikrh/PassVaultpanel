import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import { updateToastData } from '../toasterSlice';

export const addNewsToDb = createAsyncThunk(
    'news/addNews',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/news/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const newsSlice = createSlice({
    name: 'news',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
        // saveCommentaryLog: []
    },
    reducers: {
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        },
        // addSaveCommentaryLog: (state, action) => {
        //     console.log("HHHHHHHHHHH");
        //     const prevValue = state.saveCommentaryLog
        //     state.saveCommentaryLog = [].concat(prevValue, action.payload)
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addNewsToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addNewsToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addNewsToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState,
    //  addSaveCommentaryLog 
} = newsSlice.actions;
export default newsSlice.reducer;
