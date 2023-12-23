import { combineReducers } from '@reduxjs/toolkit';
import CompetitionSlice from "./competitionSlice"

const rootReducer = combineReducers({
    competition: CompetitionSlice,
});

export default rootReducer;
