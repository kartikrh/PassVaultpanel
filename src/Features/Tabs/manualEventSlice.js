import { createSlice } from "@reduxjs/toolkit";

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
  selectedMarketHistory: [
    {
      label: "Home",
      value: {
        refID: 0,
        isAustralian: false,
        isEvent: false,
        isCompitition: false,
      },
    },
  ],
};
const manualSlice = createSlice({
  name: "manualEvent",
  initialState: initialSliceState,
  reducers: {
    setSelectedMarket: (state, action) => {
      state.selectedMarket.refID = action.payload.refID;
      state.selectedMarket.isAustralian = action.payload.isAustralian
      state.selectedMarket.isEvent = action.payload.isEvent
      state.selectedMarket.isCompitition = action.payload.isCompitition
    },
    setSelectedMarketHistory: (state, action) => {
      state.selectedMarketHistory = action.payload;
    },
    updateSavedState: (state, action) => {
      state.isSaved = action.payload;
    },
  },
});
export const {
  setSelectedMarket,
  setSelectedMarketHistory,
  resetMarketSliceData,
  updateSavedState,
} = manualSlice.actions;
export default manualSlice.reducer;
