import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addUserToDb = createAsyncThunk(
    'User/addUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/user/save', data);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addUserToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addUserToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addUserToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default userSlice.reducer;
