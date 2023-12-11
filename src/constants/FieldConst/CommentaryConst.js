import { DATE_TIME_PICKER, MULTI_SELECT, SELECT, TEXT } from "../../components/Common/Const";

export const MatchDetailFields = [
    {
        name: "matchType",
        label: "Match Type",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "eventName",
        label: "Event Name",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "weather",
        label: "Weather",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "location",
        label: "Location",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "eventId",
        label: "Event Id",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "eventDate",
        label: "Event Date",
        parentclassName: "",
        type: DATE_TIME_PICKER,
    },
    {
        name: "pitch",
        label: "Pitch",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "displayStatus",
        label: "Display Status",
        parentclassName: "",
        type: TEXT,
    },
]

export const TeamDetailsFields = [
    {
        name: "teamA",
        label: "Team",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "teamCaptainA",
        label: "Team Captain",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "teamKeeperA",
        label: "Team Keeper",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "selectPlayersA",
        label: "Select Players",
        parentclassName: "",
        type: MULTI_SELECT,
    },
    {
        name: "teamB",
        label: "Co. Team",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "teamCaptainB",
        label: "Co. Team Captain",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "teamKeeperB",
        label: "Co. Team Keeper",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "selectPlayersB",
        label: "Select Players",
        parentclassName: "",
        type: MULTI_SELECT,
    },
]