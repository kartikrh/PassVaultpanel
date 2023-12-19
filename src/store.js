import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import userReducer from "./Features/Authentication/userSlice";
import tabReducer from "./Features/Tabs/combinedReducer"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    tabsData: tabReducer
  }
});

export default store;
