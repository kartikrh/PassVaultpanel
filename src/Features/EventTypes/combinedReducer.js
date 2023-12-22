import { combineReducers } from '@reduxjs/toolkit';
import EventTypeSlice from "./eventTypesSlice"

const rootReducer = combineReducers({
    eventType: EventTypeSlice,
});

export default rootReducer;
