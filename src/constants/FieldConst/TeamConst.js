import { FILE_TYPE, MULTI_SELECT, SELECT, TEXT } from "../../components/Common/Const";

export const TeamFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
        isRequired: true,
        requiredErrorMessage: "Please enter event type.",
    },
    {
        name: "teamName",
        label: "Team Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter team name.",
    },
    {
        name: "teamJerseyImage",
        label: "Team Jersey Image",
        parentclassName: "",
        type: FILE_TYPE,
    },
    {
        name: "selectPlayer",
        label: "Event Type",
        parentclassName: "",
        type: MULTI_SELECT,
    },
    {
        name: "country",
        label: "Country",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "shortName",
        label: "Short Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter short name.",
    },
    {
        name: "teamImage",
        label: "Team Image",
        parentclassName: "",
        type: FILE_TYPE,
    },
]