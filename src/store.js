import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./Features/Authentication/loginSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
  }
});

export default store;
