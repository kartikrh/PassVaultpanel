
import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
    name: 'toast',
    initialState: {
        data: null,
        type: null,
    },
    reducers: {
        updateToastData: (state, action) => {
            state.data = action.payload.data;
            state.type = action.payload.type;
        },
        clearToastData: (state) => {
            state.data = null;
            state.type = null;
        },
    },
});

export const { updateToastData, clearToastData } = toastSlice.actions;
export default toastSlice.reducer;