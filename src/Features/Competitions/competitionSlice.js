import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';

export const addCompetitionToDb = createAsyncThunk(
    'competition/addCompetition',
    async (competitionData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/competition/save', competitionData);
            return response?.result;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const competitionSlice = createSlice({
    name: 'competition',
    initialState: {
        isSaved: undefined,
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addCompetitionToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCompetitionToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addCompetitionToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default competitionSlice.reducer;
