import { IMAGE, SWITCH, TEXT } from "../../components/Common/Const";

export const EventTypeFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        isRequired: true,
        type: TEXT,
    },
    {
        name: "refId",
        label: "Reference Id",
        parentclassName: "",
        isRequired: true,
        type: TEXT,
    },
    {
        name: "remark",
        label: "Remarks",
        parentclassName: "",
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
        defaultValue: true,
        type: SWITCH
    },
    {
        name: "isHighlight",
        label: "Is Highlight",
        parentclassName: "",
        type: SWITCH
    },
]
