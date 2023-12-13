import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const TabFields = [
    {
        name: "parentTab",
        label: "Parent Tab",
        type: SELECT,
        defaultOption: { label: "Select a Parent Id", value: "Select a Parent Id" },
        options: [
            { label: "CMS", value: "CMS" },
            { label: "Tabs", value: "Tabs" },
            { label: "Roles", value: "Roles" },
            { label: "Users", value: "Users" },
            { label: "Master", value: "Master" },
            { label: "Event Type", value: "Event Type" },
            { label: "Players", value: "Players" },
            { label: "Teams", value: "Teams" },
            { label: "Match Types", value: "Match Type" },
            { label: "Panelty Run", value: "Panelty Run" },
            { label: "Competition", value: "Competition" },
            { label: "Events", value: "Events" },
            { label: "Commentary", value: "Commentary" },
        ],
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "tabName",
        label: "Tab Name",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Tab name.",
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "displayName",
        label: "Display Name",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Display name.",
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "tabDiplayType",
        label: "Tab Display Type",
        type: SELECT,
        defaultOption: { label: "Admin", value: "Admin" },
        options: [
            { label: "Admin", value: "Admin" },
            { label: "Agent", value: "Agent" },],
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "webPageRoute",
        label: "WebPage Route",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter web page route.",
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "icon",
        label: "Icon",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter icon.",
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "isAdd",
        label: "Is Add",
        type: SWITCH,
        labelColspan: { xs: 6, md: 3, lg: 1 },
        fieldColspan: { xs: 6, md: 3, lg: 5 }
    },
    {
        name: "isAddExt",
        label: "",
        type: TEXT,
        dependsOnField: "isAdd",
        labelColspan: { xs: 3, md: 2, lg: 2 },
        fieldColspan: { xs: 9, md: 4, lg: 4 }
    },
    {
        name: "isActive",
        label: "Is Active",
        type: SWITCH,
        labelColspan: { xs: 6, md: 6, lg: 1 },
        fieldColspan: { xs: 6, md: 6, lg: 2 }
    },
    {
        name: "isEdit",
        label: "Is Edit",
        type: SWITCH,
        labelColspan: { xs: 6, md: 6, lg: 1 },
        fieldColspan: { xs: 6, md: 6, lg: 2 }
    },
    {
        name: "isDelete",
        label: "Is Delete",
        type: SWITCH,
        labelColspan: { xs: 6, md: 6, lg: 1 },
        fieldColspan: { xs: 6, md: 6, lg: 2 }
    },
    {
        name: "isMenu",
        label: "Is Menu",
        type: SWITCH,
        labelColspan: { xs: 6, md: 6, lg: 1 },
        fieldColspan: { xs: 6, md: 6, lg: 2 }
    },
]