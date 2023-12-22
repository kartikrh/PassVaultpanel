import { combineReducers } from '@reduxjs/toolkit';
import PenaltyRunSlice from "./penaltyRunsSlice"

const rootReducer = combineReducers({
    penaltyRun: PenaltyRunSlice,
});

export default rootReducer;
