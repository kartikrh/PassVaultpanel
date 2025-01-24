import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import userReducer from "./Features/Authentication/userSlice";
import tabReducer from "./Features/Tabs/combinedReducer"
import toastReducer from "./Features/toasterSlice"
import marketTypeReducer from "./Features/Authentication/marketTypeSlice";
import layoutReducer from "./Features/Layout";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    toastData: toastReducer,
    tabsData: tabReducer,
    marketType: marketTypeReducer,
    layout: layoutReducer,  // Add your other reducers here for other slices of state.  For example:
  }
});

export default store;
