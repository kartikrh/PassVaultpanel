import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addCommentaryToDb = createAsyncThunk(
    'commentary/addCommentary',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/commentary/save', userData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const commentarySlice = createSlice({
    name: 'commentary',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
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
            });
    }
});

export default commentarySlice.reducer;
