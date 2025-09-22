import { COUNTER, IMAGE, MULTI_SELECT, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const PlayerFields = [
    {
        type: SELECT,
        name: "eventTypeId",
        label: "Event Type",
        options: [{ label: "Select a Event Type", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "playerName",
        label: "Player Name",
        isRequired: true,
        // regex: /^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{1,100}$/,
        regex: /^[^']{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No spacial(') character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "displayName",
        label: "Display Name",
        isRequired: true,
        regex: /^[^']{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial(') Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SELECT,
        name: "countryId",
        label: "Country",
        options: [],
        // regex: /^[^']{1,100}$/,
        // regexErrorMessage: "Max allowed Characters 100, No Spacial(') Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SELECT,
        name: "playerTypeId",
        label: "Player Type",
        isRequired: true,
        options: [{ label: "Select a Player Type", value: "0" }],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SWITCH,
        name: "isLeftHandedBatting",
        label: "Is Left Hand Batting",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SELECT,
        name: "bowlingStyle",
        label: "Bowling Style",
        options: [
            { label: "Select a Bowling Style", value: "0" },
            { label: "Pace", value: 1 },
            { label: "Spin", value: 2 },
        ],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SELECT,
        name: "bowlingTypeId",
        label: "Bowling Type",
        isRequired: true,
        options: [{ label: "Select a Bowling Type", value: "0" }],
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SWITCH,
        name: "isLeftArmFielding",
        label: "Is Left Hand Bowling",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SWITCH,
        name: "isKipper",
        label: "Is Keeper",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: MULTI_SELECT,
        options: [],
        showSelectAll: true,
        name: "teamId",
        label: "Select Team",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        type: SELECT,
        options: [],
        name: "homeTeamId",
        label: "Home Team",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "batsmanAverage",
        label: "Batsman Average",
        regex: /^[0-9]*\.?[0-9]*$/,
        regexErrorMessage: "Only Numbers are allowed",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "batsmanStrikeRate",
        label: "Batsman Strike Rate",
        regex: /^[0-9]*\.?[0-9]*$/,
        regexErrorMessage: "Only Number are allowed",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "bowlerAverage",
        label: "Bowler Average",
        regex: /^[0-9]*\.?[0-9]*$/,
        regexErrorMessage: "Only Number are allowed",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "bowlerEconomy",
        label: "Bowler Economy",
        regex: /^[0-9]*\.?[0-9]*$/,
        regexErrorMessage: "Only Number are allowed",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: IMAGE,
        name: "image",
        label: "Player Image",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "tpId",
        label: "TPID",
        type: COUNTER,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        type: SWITCH,
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
]