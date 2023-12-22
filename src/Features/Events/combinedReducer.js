import { combineReducers } from '@reduxjs/toolkit';
import eventSlice from "./eventsSlice"

const rootReducer = combineReducers({
    event: eventSlice,
});

export default rootReducer;
