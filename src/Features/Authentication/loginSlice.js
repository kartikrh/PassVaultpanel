import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for Axios
const baseURL = 'https://scorenodeapi.cloudd.live';

// Axios instance
const axiosInstance = axios.create({ baseURL });

// Async thunk for login
export const loginUser = createAsyncThunk(
  'login/user',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login', userData);
      return response.data; // Assuming this contains the token
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
  extraReducers: {
    [loginUser.pending]: (state) => {
      state.isLoading = true;
    },
    [loginUser.fulfilled]: (state, action) => {
      state.token = action.payload.token;
      state.isLoading = false;
    },
    [loginUser.rejected]: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export default loginSlice.reducer;
