import { SWITCH, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const ConfigFields=[
    {
        name: "key",
        label: "Key",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        // regex: /^[a-zA-Z0-9 ]{1,20}$/,
        // regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
        requiredErrorMessage: "Please enter Key.",
    },
    {
        name: "value",
        label: "Value",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        // regex: /^[a-zA-Z0-9 ]{1,20}$/,
        // regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
        requiredErrorMessage: "Please enter Value.",
    },
    {
        name: "desc",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        isRequired: true,
        requiredErrorMessage: "Please enter Description.",
    },
  
    {
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
    },

    {
        name: "isForAdmin",
        label: "Is For Admin",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
    },
]