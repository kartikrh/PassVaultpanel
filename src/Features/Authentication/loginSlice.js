import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { setAuthToken } from '../axios';
import { encryptData } from '../../Pages/Utility/encryptionUtils';

export const loginUser = createAsyncThunk(
  'login/user',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/signin', userData);
      return response?.data.result; // Assuming this contains the token
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    token: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.userName = action.payload.userName;
        localStorage.setItem("authUser", encryptData(action.payload))
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default loginSlice.reducer;
