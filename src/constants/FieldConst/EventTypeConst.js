import { IMAGE, SWITCH, TEXT } from "../../components/Common/Const";

export const EventTypeFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        isRequired: true,
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
    },
    {
        name: "refId",
        label: "Reference Id",
        parentclassName: "",
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        isRequired: true,
        type: TEXT,
    },
    {
        name: "remark",
        label: "Remarks",
        parentclassName: "",
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
    },
    {
        name: "image",
        label: "Image",
        parentclassName: "",
        type: IMAGE
    },
    {
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "isHighlight",
        label: "Is Highlight",
        parentclassName: "",
        type: SWITCH
    },
]
