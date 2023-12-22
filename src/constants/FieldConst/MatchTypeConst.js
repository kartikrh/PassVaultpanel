import { COUNTER, DIVIDER, SWITCH, TEXT } from "../../components/Common/Const";

export const MatchTypeFields = [
    {
        name: "name",
        label: "Name",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter name.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfInnings",
        label: "No Of Innings",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfDays",
        label: "No Of Days",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfPlayers",
        label: "No Of Players",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noOfSubstitutes",
        label: "No Of Substitutes",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: DIVIDER
    },
    {
        name: "limitedOvers",
        label: "Limited Overs",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "limitedOverValue",
        label: false,
        dependsOnField: "limitedOvers",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "bowlersOversLimited",
        label: "Bowlers Overs Limited",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "bowlersOversLimitedValue",
        label: false,
        dependsOnField: "bowlersOversLimited",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "oversInDay",
        label: "Overs In Day",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "firstInningsMaxOver",
        label: "1st Innings Max Over",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "secondInningsMaxOver",
        label: "2nd Innings Max Over",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "powerPlay",
        label: "Power Play",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "powerPlayValue",
        label: false,
        dependsOnField: "powerPlay",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        fieldColspan: { xs: 12, md: 4, lg: 3 }
    },
    {
        name: "extraInnings",
        label: "Extra Innings",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "extraInningsValue",
        label: false,
        dependsOnField: "extraInnings",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        fieldColspan: { xs: 12, md: 4, lg: 3 }
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
        name: "newBallAfterOver",
        label: "New Ball After Overs",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: DIVIDER
    },
    {
        name: "ballPerOver",
        label: "Ball Per Overs",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "noBallRun",
        label: "No Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "noBallRunExtra",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 1 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "noBallRunLastOver",
        label: "No Ball Run[Last Over]",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "noBallRunLastOverExtra",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 1 },
        fieldColspan: { xs: 12, md: 4, lg: 2 }
    },
    {
        name: "paneltyRunCountPartnership",
        label: "Penalty Run Count [Partnership]",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "frontFootNoBall",
        label: "Front Foot No. Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "wideBallRun",
        label: "Wide Ball Run",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "wideBallRunExtra",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 1 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "wideBallRunLastOver",
        label: "Wide Ball Run[Last Over]",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 1 }
    },
    {
        name: "wideBallRunLastOverExtra",
        label: "Is Extra Ball",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 1 },
        fieldColspan: { xs: 12, md: 4, lg: 2 }
    },
    {
        name: "wideBallCountPartnership",
        label: "Wide Ball Count [Partnership]",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },

];