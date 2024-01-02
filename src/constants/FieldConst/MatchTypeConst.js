import { COUNTER, DIVIDER, SWITCH, TEXT } from "../../components/Common/Const";

export const MatchTypeFields = [
    {
        type: DIVIDER,
        sectionLabel: "General Information",
        labelColspan: { xs: 12, md: 12, lg: 12 },
    },
    {
        name: "matchType",
        label: "Match Type",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter name.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 10 }
    },
    {
        name: "noOfIningsPerSide",
        label: "No Of Innings",
        type: COUNTER,
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 1,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfDays",
        label: "No Of Days",
        type: COUNTER,
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfPlayer",
        label: "No Of Players",
        type: COUNTER,
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 11,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "substitutesPlayer",
        label: "No Of Substitutes",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 0,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: DIVIDER,
        sectionLabel: "Over Information",
        labelColspan: { xs: 12, md: 12, lg: 12 },
    },
    {
        name: "isLimitedOvers",
        label: "Limited Overs",
        type: SWITCH,
        // checked
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "oversPerInings",
        label: false,
        dependsOnField: "isLimitedOvers",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        isRequired: true,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "isBowlersLimitedOvers",
        label: "Bowlers Overs Limited",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "oversPerBowler",
        label: false,
        dependsOnField: "isBowlersLimitedOvers",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        isRequired: true,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "isPowerPlay",
        label: "Power Play",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "totalPowerPlay",
        label: false,
        dependsOnField: "isPowerPlay",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        isRequired: true,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "oversPerDay",
        label: "Overs In Day",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "maxOversInFirstInings",
        label: "1st Innings Max Over",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "maxOversInSecondInings",
        label: "2nd Innings Max Over",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },

    {
        name: "isExtraInings",
        label: "Extra Innings",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "batsmenPerInings",
        label: false,
        dependsOnField: "isExtraInings",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        isRequired: true,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "oversInLastHour",
        label: "Overs In Last Hours",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "takeNewBallAfterOvers",
        label: "New Ball After Overs",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: DIVIDER,
        sectionLabel: "Ball Information",
        labelColspan: { xs: 12, md: 12, lg: 12 },
    },
    {
        name: "ballsPerOver",
        label: "Ball Per Overs",
        type: COUNTER,
        min: 1,
        max: 20,
        step: 1,
        isRequired: true,
        defaultValue: 6,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isPenaltyRunsInPartnership",
        label: "Penalty Run Count [Partnership]",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },
    {
        name: "valueOfNoBall",
        label: "No Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isExtraBallWhenNoBall",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },
    {
        name: "valueOfNoBallInLastOver",
        label: "No Ball Run[Last Over]",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isExtraBallWhenNoBallInLastOver",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },

    {
        name: "valueOfWideBall",
        label: "Wide Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isExtraBallWhenWideBall",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },
    {
        name: "valueOfWideBallInLastOver",
        label: "Wide Ball Run[Last Over]",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isExtraBallWhenWideBallInLastOver",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },
    {
        name: "valueOfFrontFootNoBall",
        label: "Front Foot No. Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "isWideBallCountInPartnership",
        label: "Wide Ball Count [Partnership]",
        type: SWITCH,
        labelColspan: { xs: 12, md: 4, lg: 4 },
        fieldColspan: { xs: 12, md: 2, lg: 3 }
    },
    {
        name: "isLastManStand",
        label: "Last Man Standing",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
];