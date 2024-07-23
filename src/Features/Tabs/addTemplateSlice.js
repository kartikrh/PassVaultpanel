import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axios";
import { updateToastData } from "../toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

export const addTemplateToDb = createAsyncThunk(
  "template/addTemplate",
  async (templateData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/template/save",
        templateData
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

const addTemplateSlice = createSlice({
  name: "template",
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
      .addCase(addTemplateToDb.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTemplateToDb.fulfilled, (state, action) => {
        state.isSaved = true;
        state.isLoading = false;
      })
      .addCase(addTemplateToDb.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSavedState } = addTemplateSlice.actions;
export default addTemplateSlice.reducer;