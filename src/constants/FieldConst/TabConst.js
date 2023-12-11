import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const TabFields = [
    {
        name: "parentTab",
        label: "Parent Tab",
        parentclassName: "",
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
    },
    {
        name: "tabName",
        label: "Tab Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Tab name.",
    },
    {
        name: "displayName",
        label: "Display Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Display name.",
    },
    {
        name: "tabDiplayType",
        label: "Tab Display Type",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Admin", value: "Admin" },
        options: [
            { label: "Admin", value: "Admin" },
            { label: "Agent", value: "Agent" },],
    },
    {
        name: "webPageRoute",
        label: "WebPage Route",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter web page route.",
    },
    {
        name: "icon",
        label: "Icon",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter icon.",
    },
    {
        name: "isAdd",
        label: "Is Add",
        parentclassName: "",
        type: SWITCH
    }, {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    }, {
        name: "isEdit",
        label: "Is Edit",
        parentclassName: "",
        type: SWITCH
    }, {
        name: "isDelete",
        label: "Is Delete",
        parentclassName: "",
        type: SWITCH
    }, {
        name: "isMenu",
        label: "Is Menu",
        parentclassName: "",
        type: SWITCH
    },
]