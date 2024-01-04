
import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
    name: 'toast',
    initialState: {
        data: undefined,
        type: undefined,
        isVisible: undefined
    },
    reducers: {
        updateToastData: (state, action) => {
            state.data = action.payload.data;
            state.type = action.payload.type;
            state.isVisible = true
        },
        clearToastData: (state) => {
            state.data = undefined;
            state.type = undefined;
            state.isVisible = false
        },
    },
});

export const { updateToastData, clearToastData } = toastSlice.actions;
export default toastSlice.reducer;