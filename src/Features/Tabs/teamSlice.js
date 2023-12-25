import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addTeamToDb = createAsyncThunk(
    'team/addTeam',
    async (teamData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/team/save', teamData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const teamSlice = createSlice({
    name: 'team',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addTeamToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addTeamToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addTeamToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default teamSlice.reducer;
