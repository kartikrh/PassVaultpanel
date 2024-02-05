import { IMAGE, SELECT, SWITCH, TEXT, TEXT_AREA, TEXT_EDITOR } from "../../components/Common/Const";

export const menuTypeFields = [
    {
        name: "blockId",
        label: "Block",
        options: [{ label: "Select a Block", value: "0" }],
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "menuTypeName",
        label: "Menu",
        isRequired: true,
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
    },
    {
        name: "noOfLevel",
        label: "No. of Level",
        isRequired: true,
        type: TEXT,
    },
    {
        name: "isActive",
        label: "Is Active",
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 4, md: 2, lg: 2 },
        fieldColspan: { xs: 8, md: 1, lg: 1 }
    },
]