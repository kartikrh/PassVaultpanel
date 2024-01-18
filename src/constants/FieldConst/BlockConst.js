import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const BlockFields=[
    {
        name: "blockName",
        label: "Block Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        regex: /^[a-zA-Z0-9 ]{1,20}$/,
        regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
        requiredErrorMessage: "Please enter full name.",
    },
    {
        name: "content",
        label: "Content",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        regex: /^[a-zA-Z0-9 ]{1,20}$/,
        regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
        requiredErrorMessage: "Please enter full name.",
    },
    {
        name: "containerId",
        label: "Container Id",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter full name.",
    },
    {
        name: "isShowContent",
        label: "Is Show Contain",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
    },
]