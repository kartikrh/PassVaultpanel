import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addTabToDb = createAsyncThunk(
    'tab/addTab',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/tabs/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
const initialSliceState = {
    isSaved: undefined,
    isLoading: false,
    error: null,
    selectedTab: { id: "0", displayType: "0" },
    selectedTabHistory: [{
        label: "Tabs", value: "0"
    }]
}
const tabSlice = createSlice({
    name: 'tab',
    initialState: initialSliceState,
    reducers: {
        setSelectedTab: (state, action) => {
            state.selectedTab.id = action.payload.id
            state.selectedTab.displayType = action.payload.displayType
        },
        setSelectedTabHistory: (state, action) => {
            state.selectedTabHistory = action.payload
        },
        resetTabSliceData: (state, action) => {
            state.selectedTab = initialSliceState.selectedTab
            state.selectedTab.displayType = initialSliceState.payload.displayType
            state.selectedTabHistory = initialSliceState.selectedTabHistory
            state.isSaved = initialSliceState.isSaved
            state.isLoading = initialSliceState.isLoading
            state.error = initialSliceState.error
        },
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addTabToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addTabToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addTabToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});
export const { setSelectedTab, setSelectedTabHistory, resetTabSliceData, updateSavedState } = tabSlice.actions;
export default tabSlice.reducer;
