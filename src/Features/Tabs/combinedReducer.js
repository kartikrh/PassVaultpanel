import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"
import MatchTypeSLice from "./commentarySlice"
import usersSlice from "./usersSlice"
import playerSlice from "./playerSlice"
import PenaltyRunSlice from "./penaltyRunsSlice"
import EventTypeSlice from "./eventTypesSlice"
import eventSlice from "../Tabs/eventsSlice"

const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice,
    matchType: MatchTypeSLice,
    user: usersSlice,
    player: playerSlice,
    penaltyRun: PenaltyRunSlice,
    eventType: EventTypeSlice,
    event: eventSlice,
});

export default rootReducer;
