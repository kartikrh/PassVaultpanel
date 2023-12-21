import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { setAuthToken } from '../axios';
import { encryptData, removeStorageToken } from '../../Pages/Utility/encryptionUtils';
import { isUserLogout } from '../../helpers/api_helper';

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/signin', userData);
      return response?.result; // Assuming this contains the token
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/signout');
      return response?.result; // Assuming this contains the token
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    isLoading: false,
    error: null,
    isUserLogout: isUserLogout
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
        state.isUserLogout = false;
        localStorage.setItem("authUser", encryptData(action.payload));
        localStorage.setItem('loggedIn', true);
        setAuthToken(action.payload.token);
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.token = null;
        state.userName = null;
        state.isUserLogout = true;
        localStorage.setItem('loggedIn', false);
        removeStorageToken()
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isUserLogout = true;
        localStorage.setItem('loggedIn', false);
        removeStorageToken()
      });
  }
});

export default userSlice.reducer;
