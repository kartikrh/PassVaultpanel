import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../axios';
import { updateToastData } from '../toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

export const addMenuTypeToDb = createAsyncThunk(
    'menuType/addMenuType',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/menuTypes/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
export const addMenuItemToDb = createAsyncThunk(
    'menuItem/addMenuItem',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/admin/menuItem/save', data);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            return response?.result;
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            return rejectWithValue(error?.message);
        }
    }
);
const initialSliceState = {
    isSaved: undefined,
    isLoading: false,
    error: null,
    selectedMenuType: {  
        isActive: true,
        parentId: 0, 
        level: 0,
        id:0,
        menuTypeId:0,
        menuItemId:0,
    },
    selectedMenuTypeHistory: [{
        label: "MenuType", value: {
            isActive: true,
            parentId: 0, 
            level: 0,
            id:0,
            menuTypeId:0,
            menuItemId:0,
        }
    }]
}
const menuTypeSlice = createSlice({
    name: 'menuType',
    initialState: initialSliceState,
    reducers: {
        setSelectedMenuType: (state, action) => {
            state.selectedMenuType.level = action.payload.level
            state.selectedMenuType.parentId = action.payload.parentId
            state.selectedMenuType.id = action.payload.id
            state.selectedMenuType.menuTypeId = action.payload.menuTypeId
            state.selectedMenuType.menuItemId = action.payload.menuItemId
        },
        setSelectedMenuTypeHistory: (state, action) => {
            state.selectedMenuTypeHistory = action.payload
        },
        resetMenuTypeSliceData: (state, action) => {
            state.selectedMenuType = initialSliceState.selectedMenuType
            state.selectedMenuType.displayType = initialSliceState.payload.displayType
            state.selectedMenuTypeHistory = initialSliceState.selectedMenuTypeHistory
            state.isSaved = initialSliceState.isSaved
            state.isLoading = initialSliceState.isLoading
            state.error = initialSliceState.error
        },
        updateSavedState: (state, action) => {
            state.isSaved = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addMenuTypeToDb.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addMenuTypeToDb.fulfilled, (state, action) => {
                state.isSaved = true
                state.isLoading = false;
            })
            .addCase(addMenuTypeToDb.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});
export const { setSelectedMenuType, setSelectedMenuTypeHistory, resetMenuSliceData, updateSavedState, } = menuTypeSlice.actions;
export default menuTypeSlice.reducer;
