import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"

const rootReducer = combineReducers({
    tab: TabSlice,
});

export default rootReducer;
