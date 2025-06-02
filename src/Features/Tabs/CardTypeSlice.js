import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addCardTypeToDB = createAsyncThunk(
    'cardtype/addCardType',
    async (cardtypeData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/cardType/save', cardtypeData);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);

const CardTypeSlice = createSlice({
    name: 'cardtype',
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
            .addCase(addCardTypeToDB.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCardTypeToDB.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addCardTypeToDB.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSavedState } = CardTypeSlice.actions;
export default CardTypeSlice.reducer;
