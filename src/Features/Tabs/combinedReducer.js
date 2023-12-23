import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"
import MatchTypeSLice from "./commentarySlice"

const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice,
    matchType: MatchTypeSLice
});

export default rootReducer;
