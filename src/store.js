import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/Authentication/authorizationSlice";
import userReducer from "./Features/Authentication/userSlice";
import tabReducer from "./Features/Tabs/combinedReducer"
import eventReducer from './Features/Events/combinedReducer'
import users from './Features/Users/usersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    tabsData: tabReducer,
    eventsData: eventReducer,
    usersData: users
  }
});

export default store;
