import { FILE_TYPE, SWITCH, TEXT } from "../../components/Common/Const";

export const EventTypeFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "referenceIf",
        label: "Reference Id",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "remarks",
        label: "Remarks",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "eventImage",
        label: "Event Image",
        parentclassName: "",
        type: FILE_TYPE
    },
    {
        name: "isActive",
        label: "Is Active",
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
