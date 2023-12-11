import { FILE_TYPE, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const PlayerFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "playerName",
        label: "Player Name",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "displayName",
        label: "Display Name",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "selectTeam",
        label: "Select Team",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "country",
        label: "Country",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "batsmanAverage",
        label: "Batsman Average",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "bowlerAverage",
        label: "Bowler Average",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "playerImage",
        label: "Player Image",
        parentclassName: "",
        type: FILE_TYPE
    },
    {
        name: "playerType",
        label: "Player Type",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "bowlingStyle",
        label: "Bowling Style",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "batsmanStrikeRate",
        label: "Batsman Strike Rate",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "bowlerEconomy",
        label: "Bowler Economy",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "isLeftBowler",
        label: "Is Left Hand Bowling",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "isLeftBatting",
        label: "Is Left Hand Batting",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "isKeeper",
        label: "Is Keeper",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    },
]