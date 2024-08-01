import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS, WARNING } from '../../components/Common/Const';

export const addMarketTemplateToDb = createAsyncThunk(
    'marketTemplate/addMarketTemplate',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/marketTemplate/save', data);
            if(response?.result?.callPrediction?.predictioncallSuccess === false) {
              const predictionMessage = response?.result?.callPrediction?.predictionMessage;
              const endPoint = response?.result?.callPrediction?.endPoint;
              dispatch(
                updateToastData({
                  data: `${endPoint}\n${predictionMessage}`,
                  title: "Call Prediction",
                  type: WARNING,
                })
              );
            }
            else {
              dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            }
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
const marketTemplateSlice = createSlice({
    name: 'marketTemplate',
    initialState: initialSliceState,
    reducers: {
        setSelectedMarketTemplate: (state, action) => {
            state.selectedMarketTemplate.id = action.payload.id
            state.selectedMarketTemplate.displayType = action.payload.displayType
        },
        setSelectedMarketTemplateHistory: (state, action) => {
            state.selectedMarketTemplateHistory = action.payload
        },
        resetMarketTemplateSliceData: (state, action) => {
            state.selectedMarketTemplate = initialSliceState.selectedMarketTemplate
            state.selectedMarketTemplate.displayType = initialSliceState.payload.displayType
            state.selectedMarketTemplateHistory = initialSliceState.selectedMarketTemplateHistory
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
            .addCase(addMarketTemplateToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addMarketTemplateToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addMarketTemplateToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});
export const { setSelectedMarketTemplate, setSelectedMarketTemplateHistory, resetMarketTemplateSliceData, updateSavedState } = marketTemplateSlice.actions;
export default marketTemplateSlice.reducer;
