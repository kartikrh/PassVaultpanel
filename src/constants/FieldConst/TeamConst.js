import { IMAGE, MULTI_SELECT, SELECT, TEXT } from "../../components/Common/Const";

export const TeamFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
        isRequired: true,
        requiredErrorMessage: "Please enter event type.",
        options: [{ label: "Select Event Type", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
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
        name: "jersey",
        label: "Jersey Image",
        parentclassName: "",
        type: IMAGE,
    },
    {
        name: "players",
        label: "Select Players",
        options: [],
        showSelectAll: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
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
        name: "image",
        label: "Team Image",
        parentclassName: "",
        type: IMAGE,
    },
]