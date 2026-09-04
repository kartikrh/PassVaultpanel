import { createSlice } from '@reduxjs/toolkit';

const theme = localStorage.getItem('panelTheme') || 'light';
document.body.setAttribute('data-theme', theme);

const layout = localStorage.getItem('layoutType') || 'vertical';

// Global "which timezone am I looking at / entering dates in" preference --
// previously re-derived independently on every listing page from the same
// "DateType" localStorage key (each page's own useState, no cross-page
// sync), and never actually reachable via UI for most of those pages (see
// components/Common/Table/index.js's isDateTypeSelect dropdown, gated to a
// different hardcoded set of page titles). Centralized here + the header's
// settings panel instead, same localStorage key for continuity with
// whatever a user already had picked.
const DEFAULT_DATE_TYPE = { label: 'Local Timezone', value: 1 };
let storedDateType = null;
try {
    storedDateType = JSON.parse(localStorage.getItem('DateType'));
} catch (e) {
    storedDateType = null;
}

const initialState = {
    layoutType: layout,
    layoutWidth: 'fluid',
    panelTheme: theme,
    leftSideBarType: 'default',
    topbarTheme: 'light',
    isRightSidebar: false,
    isMobile: false,
    showSidebar: true,
    leftMenu: false,
    sidebarMenuData: [],
    dateType: storedDateType || DEFAULT_DATE_TYPE,
};

const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        changeLayout: (state, action) => {
            state.layoutType = action.payload;
            localStorage.setItem('layoutType', action.payload);
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
        changeDateType: (state, action) => {
            state.dateType = action.payload;
            localStorage.setItem('DateType', JSON.stringify(action.payload));
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
    changeDateType,
} = layoutSlice.actions;

// Reducer
export default layoutSlice.reducer;
