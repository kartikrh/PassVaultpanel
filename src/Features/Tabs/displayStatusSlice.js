import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axios";
import { updateToastData } from "../toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

export const addDisplayStatusToDb = createAsyncThunk(
  "displayStatus/addDisplayStatus",
  async (displayStatusData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/displayStatus/save",
        displayStatusData
      );
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
      return response?.result;
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
      return rejectWithValue(error?.message);
    }
  }
);

const displayStatusSlice = createSlice({
  name: "displayStatus",
  initialState: {
    isSaved: undefined,
    isLoading: false,
    error: null,
  },
  reducers: {
    updateSavedState: (state, action) => {
      state.isSaved = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDisplayStatusToDb.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addDisplayStatusToDb.fulfilled, (state, action) => {
        state.isSaved = true;
        state.isLoading = false;
      })
      .addCase(addDisplayStatusToDb.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedState } = displayStatusSlice.actions;
export default displayStatusSlice.reducer;
