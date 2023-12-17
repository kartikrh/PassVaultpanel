import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for Axios
const baseURL = `${process.env.REACT_APP_BASE_URL}`

// Axios instance
const axiosInstance = axios.create({ baseURL });

// Async thunk for login
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

// Slice for login
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
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default loginSlice.reducer;
