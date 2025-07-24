import { createSlice } from '@reduxjs/toolkit';

const theme = localStorage.getItem('panelTheme') || 'light';
document.body.setAttribute('data-theme', theme);

const initialState = {
    layoutType: 'vertical',
    layoutWidth: 'fluid',
    panelTheme: theme,
    leftSideBarType: 'default',
    topbarTheme: 'light',
    isRightSidebar: false,
    isMobile: false,
    showSidebar: true,
    leftMenu: false,
    sidebarMenuData: [],
};

const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        changeLayout: (state, action) => {
            state.layoutType = action.payload;
        },
        changeLayoutWidth: (state, action) => {
            state.layoutWidth = action.payload;
        },
        changeSidebarTheme: (state, action) => {
            state.panelTheme = action.payload;
            document.body.setAttribute('data-theme', action.payload)
            localStorage.setItem('panelTheme', action.payload);
        },
        changeSidebarType: (state, action) => {
            const { sidebarType, isMobile } = action.payload;
            state.leftSideBarType = sidebarType;
            state.isMobile = isMobile;
        },
        changeTopbarTheme: (state, action) => {
            state.topbarTheme = action.payload;
        },
        showRightSidebar: (state, action) => {
            console.log(action.payload)
            state.isRightSidebar = action.payload;
        },
        showSidebar: (state, action) => {
            state.showSidebar = action.payload;
        },
        toggleLeftmenu: (state, action) => {
            state.leftMenu = action.payload;
        },
        setSidebarMenuData: (state, action) => {
            state.sidebarMenuData = action.payload;
        },
    },
});

export const {
    changeLayout,
    changeLayoutWidth,
    changeSidebarTheme,
    changeSidebarType,
    changeTopbarTheme,
    showRightSidebar,
    showSidebar,
    toggleLeftmenu,
    setSidebarMenuData,
} = layoutSlice.actions;

// Reducer
export default layoutSlice.reducer;
