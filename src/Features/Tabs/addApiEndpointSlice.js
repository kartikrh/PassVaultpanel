import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axios";
import { updateToastData } from "../toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

export const addApiEndpointToDb = createAsyncThunk(
  "apiEndpoints/addApiEndpoint",
  async (apiEndpointData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/apiEndpoint/save",
        apiEndpointData
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

const addApiEndpointSlice = createSlice({
  name: "apiEndpoints",
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
      .addCase(addApiEndpointToDb.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addApiEndpointToDb.fulfilled, (state, action) => {
        state.isSaved = true;
        state.isLoading = false;
      })
      .addCase(addApiEndpointToDb.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedState } = addApiEndpointSlice.actions;
export default addApiEndpointSlice.reducer;