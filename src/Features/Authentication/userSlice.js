import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { setAuthToken } from '../axios';
import { encryptData, removeStorageToken } from '../../Pages/Utility/encryptionUtils';
import { getLoggedinUserName, getToken, isUserLogout } from '../../helpers/api_helper';
import { ERROR, REMEMBER_ME_KEY, USER_DATA_KEY } from '../../components/Common/Const';
import { updateToastData } from '../toasterSlice';

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/signin', userData);
      const rememberMe = JSON.parse(localStorage.getItem(REMEMBER_ME_KEY) || null);
      if (rememberMe) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
      } else {
        localStorage.setItem(USER_DATA_KEY, null)
      }
      return response?.result; // Assuming this contains the token
    } catch (error) {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      return rejectWithValue(error?.message);
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
      return rejectWithValue(error?.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: getToken(),
    userName: getLoggedinUserName(),
    isLoading: false,
    error: null,
    isUserLogout: isUserLogout
  },
  reducers: {
    resetUserSlice: (state, action) => {
      state = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.userName = action.payload.userName;
        state.refData = action.payload.refData
        state.isUserLogout = false;
        localStorage.setItem("authUser", encryptData(action.payload));
        localStorage.setItem("refData", JSON.stringify(action.payload.refData));
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
export const { resetUserSlice } = userSlice.actions;
export default userSlice.reducer;
