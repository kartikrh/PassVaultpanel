import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const TabFields = [
    {
        name: "parentId",
        label: "Parent",
        type: SELECT,
        options: [{ label: "Select a Parent Id", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "displayType",
        label: "Display Type",
        type: SELECT,
        defaultOption: { label: "Admin", value: "1" },
        defaultValue: "1",
        options: [
            { label: "Admin", value: 1 },
            { label: "Agent", value: 2 },],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "tabName",
        label: "Tab",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Tab name.",
        regex: /^.{1,20}$/,
        regexErrorMessage: "Max allowed Characters 20",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "displayName",
        label: "Display Name",
        type: TEXT,
        isRequired: true,
        regex: /^[a-zA-Z0-9 ]{1,10}$/,
        requiredErrorMessage: "Please enter Display name.",
        regexErrorMessage: "Max allowed Characters 10, No Spacial Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },

    {
        name: "webPage",
        label: "WebPage Route",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter web page route.",
        regex: /^.{1,20}$/,
        regexErrorMessage: "Max allowed Characters 20",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "iconName",
        label: "Icon",
        type: TEXT,
        regex: /^.{0,20}$/,
        regexErrorMessage: "Max allowed Characters 20",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isAdd",
        label: "Is Add",
        type: SWITCH,
        labelColspan: { xs: 4, md: 2, lg: 2 },
        fieldColspan: { xs: 8, md: 4, lg: 4 }
    },
    {
        name: "addWebpage",
        label: "Add Page Route",
        type: TEXT,
        dependsOnField: "isAdd",
        isRequired: true,
        requiredErrorMessage: "Please enter add page route.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isActive",
        label: "Is Active",
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 4, md: 2, lg: 2 },
        fieldColspan: { xs: 8, md: 1, lg: 1 }
    },
    {
        name: "isEdit",
        label: "Is Edit",
        type: SWITCH,
        labelColspan: { xs: 4, md: 1, lg: 1 },
        fieldColspan: { xs: 8, md: 2, lg: 2 }
    },
    {
        name: "isDelete",
        label: "Is Delete",
        type: SWITCH,
        labelColspan: { xs: 4, md: 2, lg: 2 },
        fieldColspan: { xs: 8, md: 1, lg: 1 }
    },
    {
        name: "isMenu",
        label: "Is Menu",
        type: SWITCH,
        labelColspan: { xs: 4, md: 1, lg: 1 },
        fieldColspan: { xs: 8, md: 2, lg: 2 }
    },
]