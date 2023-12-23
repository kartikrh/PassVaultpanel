import { combineReducers } from '@reduxjs/toolkit';
import usersSlice from "./usersSlice"

const rootReducer = combineReducers({
    user: usersSlice,
});

export default rootReducer;
