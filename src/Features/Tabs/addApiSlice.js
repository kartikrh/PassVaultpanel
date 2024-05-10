import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axios";
import { updateToastData } from "../toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

export const addApiToDb = createAsyncThunk(
  "apis/addApi",
  async (apiData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/api/save",
        apiData
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

const addApiSlice = createSlice({
  name: "apis",
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
      .addCase(addApiToDb.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addApiToDb.fulfilled, (state, action) => {
        state.isSaved = true;
        state.isLoading = false;
      })
      .addCase(addApiToDb.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedState } = addApiSlice.actions;
export default addApiSlice.reducer;