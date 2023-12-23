import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"
import MatchTypeSLice from "./commentarySlice"
import usersSlice from "./usersSlice"
import playerSlice from "./playerSlice"

const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice,
    matchType: MatchTypeSLice,
    user: usersSlice,
    player: playerSlice
});

export default rootReducer;
