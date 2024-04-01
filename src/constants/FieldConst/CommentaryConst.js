import { PLAYER, TEAM } from "../../Pages/Commentary/CommentartConst";
import { DATE_TIME_PICKER, MULTI_SELECT, SELECT, TEXT, SWITCH, COUNTER, LABEL } from "../../components/Common/Const";

export const MatchDetailFields = [
    {
        name: "eventTypeId",
        label: "Event Type",
        options: [{ label: "Select a Event Type", value: "0" }],
        defaultValue: "0",
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "competitionId",
        label: "Competition Type",
        options: [{ label: "Select a Competition Type", value: "0" }],
        defaultValue: "0",
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "eventId",
        label: "Event",
        options: [{ label: "Select a Event", value: "0" }],
        defaultValue: "0",
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "matchTypeId",
        label: "Match Type",
        options: [{ label: "Select a Match Type", value: "0" }],
        defaultValue: "0",
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "eventRefId",
        label: "Event Ref Id",
        defaultValueDepends: "",
        isRequired: true,
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: TEXT,
    },
    {
        name: "eventName",
        label: "Event Name",
        isRequired: true,
        regex: /^.{0,500}$/,
        regexErrorMessage: "Max allowed Characters 500",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: TEXT,
    },
    {
        name: "eventDate",
        label: "Event Date",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: DATE_TIME_PICKER,
    },
    {
        name: "location",
        label: "Location",
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: TEXT,
    },

    {
        name: "weather",
        label: "Weather",
        defaultValue: "0",
        options: [
            { label: "Select Weather", value: "0" },
            { label: "Sunny", value: "1" },
            { label: "Cloudy", value: "2" },
            { label: "Rainy", value: "3" },
            { label: "Drizzling", value: "4" },
            { label: "Showers", value: "5" },
            { label: "Humid", value: "6" },
            { label: "Hot", value: "7" },
            { label: "Windy", value: "8" },
            { label: "Wet", value: "9" },
        ],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    {
        name: "pitch",
        label: "Pitch",
        defaultValue: "0",
        options: [
            { label: "Select Pitch", value: "0" },
            { label: "Hard", value: "1" },
            { label: "Wet", value: "2" },
            { label: "Damp", value: "3" },
            { label: "Green", value: "4" },
            { label: "Cracked", value: "5" },
            { label: "Dry", value: "6" },
            { label: "Patch", value: "7" },],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    // {
    //     name: "displayStatus",
    //     label: "Display Status",
    //     labelColspan: { xs: 12, md: 2, lg: 2 },
    //     fieldColspan: { xs: 12, md: 4, lg: 4 },
    //     regex: /^[a-zA-Z0-9 ]{0,100}$/,
    //     regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
    //     type: TEXT,
    // },
    {
        name: "delay",
        label: "Event Delay",
        isRequired: true,
        defaultValue: 5,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: TEXT,
    },
    {
        name: "isPredictMarket",
        label: "Predict Market",
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 },
        type: SWITCH,
    },
    {
        name: "isActive",
        label: "IsActive",
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 },
        type: SWITCH,
    },
    {
        name: "isClientShow",
        label: "IsClient",
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 },
        type: SWITCH,
    },
]

export const TeamDetailsFields = [
    {
        name: "team1Id",
        label: "Team",
        type: SELECT,
        defaultValue: "0",
        onchangeApi: true,
        isRequired: true,
        options: [{ label: "Select a A Team", value: "0" }],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        name: "team2Id",
        label: "Co. Team",
        options: [{ label: "Select a A Team", value: "0" }],
        defaultValue: "0",
        onchangeApi: true,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    {
        name: "team1Captain",
        label: "Team Captain",
        options: [{ label: "Select a Captain", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    {
        name: "team2Captain",
        label: "Co. Team Captain",
        type: SELECT,
        isRequired: true,
        options: [{ label: "Select a Captain", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        name: "team1Kipper",
        label: "Team Keeper",
        options: [{ label: "Select a A Keeper", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    {
        name: "team2Kipper",
        label: "Co. Team Keeper",
        options: [{ label: "Select a Keeper", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: SELECT,
    },
    {
        name: "team1Players",
        label: "Select Players",
        options: [],
        showSelectAll: true,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: MULTI_SELECT,
    },
    {
        name: "team2Players",
        label: "Select Players",
        options: [],
        showSelectAll: true,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: MULTI_SELECT,
    },
    {
        name: "addSystemPlayer",
        label: "Is System Players",
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 },
        type: SWITCH,
    },

    {
        name: "systemPlayerCount",
        label: false,
        dependsOnField: "addSystemPlayer",
        dependsOnValue: true,
        defaultValue: 1,
        type: COUNTER,
        min: 0,
        max: 11,
        step: 1,
        requiredErrorMessage: "Please enter value",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
]

export const SHORT_COMMENTARY_TEAM = [
    {
        name: "teamScore",
        placeholder: "Score",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamWicket",
        placeholder: "Wicket",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamOver",
        placeholder: "Over",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamStatus",
        placeholder: "Status",
        formName: TEAM,
        type: SELECT,
        defaultValue: 1,
        options: [
            { label: "Batting", value: 1 },
            { label: "Bowling", value: 2 },
        ],
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamTrialRuns",
        placeholder: "Trial",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamLeadRuns",
        placeholder: "Lead",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamWideRuns",
        placeholder: "Wide",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamByRuns",
        placeholder: "By",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamLegByRuns",
        placeholder: "Leg Bye",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "teamNoBallRuns",
        placeholder: "No Ball",
        formName: TEAM,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },

]

export const SHORT_COMMENTARY_BATTING_PLAYER = [
    {
        name: "batRun",
        placeholder: "Runs",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 3 },

    },
    {
        name: "batBall",
        placeholder: "Balls",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 3 },

    },
    {
        name: "batFour",
        placeholder: "Four",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "batSix",
        placeholder: "Six",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "batterOrder",
        placeholder: "Order",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
]

export const SHORT_COMMENTARY_BOWLING_PLAYER = [
    {
        name: "bowlerOver",
        placeholder: "Over",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },
    },
    {
        name: "bowlerCurrentBall",
        placeholder: "Current Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerTotalBall",
        placeholder: "Total Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerRun",
        placeholder: "Runs",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerDotBall",
        placeholder: "Dot Balls",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerMaidenOver",
        placeholder: "Maiden Over",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerFour",
        placeholder: "Four",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerSix",
        placeholder: "Six",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerWideBall",
        placeholder: "Wide Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerWideBallRun",
        placeholder: "Wide Ball Run",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerNoBall",
        placeholder: "No Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerNoBallRun",
        placeholder: "No Ball Run",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerByeBall",
        placeholder: "Bye Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerByeBallRun",
        placeholder: "Bye Ball Run",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerLegByeBall",
        placeholder: "Leg Ball",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerLegByeBallRun",
        placeholder: "Leg Ball Run",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerTotalWicket",
        placeholder: "Wickets",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
    {
        name: "bowlerOrder",
        placeholder: "Bowler Order",
        formName: PLAYER,
        type: COUNTER,
        fieldColspan: { xs: 3, md: 4, lg: 2 },

    },
]

export const BALL_FEATURE_FIELDS = [
    {
        name: "ballRun",
        label: "Run",
        placeholder: "Run",
        formName: PLAYER,
        type: COUNTER,
        labelColspan: { xs: 3, md: 1, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 2 },
    },
    {
        name: "ballExtraRun",
        label: "Extra",
        placeholder: "Extra",
        formName: PLAYER,
        type: COUNTER,
        labelColspan: { xs: 3, md: 1, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 2 },
    },
    {
        name: "ballFour",
        label: "Four",
        placeholder: "Four",
        formName: PLAYER,
        type: COUNTER,
        labelColspan: { xs: 3, md: 1, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 2 },
    },
    {
        name: "ballSix",
        label: "Six",
        placeholder: "Six",
        formName: PLAYER,
        type: COUNTER,
        labelColspan: { xs: 3, md: 1, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 2 },
    },
]

export const TEAM_FEATURE_FIELDS = [
    {
        name: "teamScore",
        label: "Score",
        placeholder: "Score",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamWicket",
        label: "/",
        placeholder: "Wicket",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamOver",
        label: "Over",
        placeholder: "Over",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamStatus",
        label: "Status",
        placeholder: "Status",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamTrialRuns",
        label: "Trial",
        placeholder: "Trial",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamLeadRuns",
        label: "Lead",
        placeholder: "Lead",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamWideRuns",
        label: "Wide",
        placeholder: "Wide",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamByRuns",
        label: "By",
        placeholder: "By",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamLegByRuns",
        label: "Leg Bye",
        placeholder: "Leg Bye",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },
    {
        name: "teamNoBallRuns",
        label: "No Ball",
        placeholder: "No Ball",
        formName: TEAM,
        type: COUNTER,
        labelColspan: { xs: 3, md: 2, lg: 1 },
        fieldColspan: { xs: 3, md: 2, lg: 1 },
    },

]