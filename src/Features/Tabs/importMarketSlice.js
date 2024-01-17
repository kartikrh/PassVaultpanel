import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';


const initialSliceState = {
    isSaved: undefined,
    isLoading: false,
    error: null,
    selectedMarket: { 
        refID: 0,
        isAustralian: false,
        isEvent: false,
        isCompitition: false,
     },
    selectedMarketHistory: [{
        label: "Import market", value: "0"
    }]
}
const marketSlice = createSlice({
    name: 'importMarket',
    initialState: initialSliceState,
    reducers: {
        setSelectedMarket: (state, action) => {
            state.selectedMarket.refID = action.payload.refID
            state.selectedMarket.isAustralian = action.payload.isAustralian
            state.selectedMarket.isEvent = action.payload.isEvent
            state.selectedMarket.isCompitition = action.payload.isCompitition
        },
        setSelectedMarketHistory: (state, action) => {
            state.selectedTabHistory = action.payload
        },
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        }
    },
});
export const { setSelectedMarket, setSelectedMarketHistory, resetMarketSliceData, updateSavedState } = marketSlice.actions;
export default marketSlice.reducer;
