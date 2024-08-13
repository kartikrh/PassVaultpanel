import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axios";
import { updateToastData } from "../toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

export const addMailSettingsToDb = createAsyncThunk(
  "mailSettings/addMailSettings",
  async (mailSettingsData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/mailSettings/save",
        mailSettingsData
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

const addMailSettingsSlice = createSlice({
  name: "mailSettings",
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
      .addCase(addMailSettingsToDb.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMailSettingsToDb.fulfilled, (state, action) => {
        state.isSaved = true;
        state.isLoading = false;
      })
      .addCase(addMailSettingsToDb.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedState } = addMailSettingsSlice.actions;
export default addMailSettingsSlice.reducer;