import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import loginReducer from "./Features/Authentication/loginSlice";
import tabReducer from "./Features/Tabs/combinedReducer"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    login: loginReducer,
    tabsData: tabReducer
  }
});

export default store;
