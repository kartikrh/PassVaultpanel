import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import userReducer from "./Features/Authentication/userSlice";
import tabReducer from "./Features/Tabs/combinedReducer"
import toastReducer from "./Features/toasterSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    toastData: toastReducer,
    tabsData: tabReducer,
  }
});

export default store;
