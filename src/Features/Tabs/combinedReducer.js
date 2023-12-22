import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"

const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice
});

export default rootReducer;
