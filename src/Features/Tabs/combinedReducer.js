import { combineReducers } from '@reduxjs/toolkit';
import TabSlice from "./tabsSlice"
import CommentarySlice from "./commentarySlice"
import MatchTypeSLice from "./matchTypeSlice"
import usersSlice from "./usersSlice"
import playerSlice from "./playerSlice"
import PenaltyRunSlice from "./penaltyRunsSlice"
import EventTypeSlice from "./eventTypesSlice"
import eventSlice from "./eventsSlice"
import roleSlice from './roleSlice';
import CompetitionSlice from "./competitionSlice"
import TeamSlice from "./teamSlice"
import changePasswordSlice from './changePasswordSlice';
import importMarketSlice from './importMarketSlice';
import BlockSlice from './BlockSlice';
const rootReducer = combineReducers({
    tab: TabSlice,
    commentary: CommentarySlice,
    matchType: MatchTypeSLice,
    user: usersSlice,
    player: playerSlice,
    penaltyRun: PenaltyRunSlice,
    eventType: EventTypeSlice,
    event: eventSlice,
    competition: CompetitionSlice,
    team: TeamSlice,
    role: roleSlice,
    changePassword: changePasswordSlice,
    importMarket : importMarketSlice,
    block:BlockSlice

});

export default rootReducer;
