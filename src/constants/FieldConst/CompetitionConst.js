import { FILE_TYPE, IMAGE, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const CompetitionFields = [
    {
        name: "eventTypeId",
        label: "Event Type",
        isRequired: true,
        parentclassName: "",
        type: SELECT,
        options: [{ label: "Select Event Type", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "competition",
        isRequired: true,
        label: "Competition",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "refId",
        isRequired: true,
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
        type: IMAGE,
    },
]