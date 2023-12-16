import { FILE_TYPE, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const CompetitionFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "competition",
        label: "Competition",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "referenceId",
        label: "Reference Id",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "eventImage",
        label: "Event Image",
        parentclassName: "",
        type: FILE_TYPE,
    },
]