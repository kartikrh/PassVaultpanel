import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"
import MatchTypeSLice from "./commentarySlice"
import usersSlice from "./usersSlice"

const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice,
    matchType: MatchTypeSLice,
    user: usersSlice,
});

export default rootReducer;
