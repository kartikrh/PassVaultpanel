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

// Second step of a 2FA-gated sign-in -- posts the code the user scanned/
// typed against the pendingToken loginUser.fulfilled stashed in state.
export const verifyOtp = createAsyncThunk(
  'user/verifyOtp',
  async ({ pendingToken, code }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/signin/verifyOtp', { pendingToken, code });
      return response?.result;
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
    isUserLogout: isUserLogout,
    // Set by loginUser.fulfilled when the account has 2FA on -- Login.js
    // renders the code-entry (and QR, first time) step while this is truthy,
    // instead of navigating away like a normal successful login.
    otpRequired: false,
    otpType: null,
    qrCode: null,
    pendingToken: null,
  },
  reducers: {
    resetUserSlice: (state, action) => {
      state = undefined
    },
    cancelOtpChallenge: (state) => {
      state.otpRequired = false;
      state.otpType = null;
      state.qrCode = null;
      state.pendingToken = null;
    },
  },
  extraReducers: (builder) => {
    const applySession = (state, payload) => {
      state.token = payload.token;
      state.userName = payload.userName;
      state.refData = payload.refData;
      state.isUserLogout = false;
      state.otpRequired = false;
      state.otpType = null;
      state.qrCode = null;
      state.pendingToken = null;
      localStorage.setItem("authUser", encryptData(payload));
      localStorage.setItem("refData", JSON.stringify(payload.refData));
      localStorage.setItem('loggedIn', true);
      setAuthToken(payload.token);
    };

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload?.otpRequired) {
          state.otpRequired = true;
          state.otpType = action.payload.otpType;
          state.qrCode = action.payload.qrCode || null;
          state.pendingToken = action.payload.pendingToken;
        } else {
          applySession(state, action.payload);
        }
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        applySession(state, action.payload);
        state.isLoading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
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
export const { resetUserSlice, cancelOtpChallenge } = userSlice.actions;
export default userSlice.reducer;
