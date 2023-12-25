import { combineReducers } from '@reduxjs/toolkit';
import TeamSlice from "./teamSlice"

const rootReducer = combineReducers({
    team: TeamSlice,
});

export default rootReducer;
