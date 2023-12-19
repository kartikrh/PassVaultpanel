import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import loginReducer from "./Features/Authentication/loginSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    login: loginReducer,
  }
});

export default store;
