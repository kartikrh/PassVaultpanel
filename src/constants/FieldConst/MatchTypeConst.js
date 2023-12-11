import { COUNTER, SWITCH, TEXT } from "../../components/Common/Const";

export const GeneralInformationFields = [
    {
        name: "name",
        label: "Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter name.",
    },
    {
        name: "noOfInnings",
        label: "No Of Innings",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noOfDays",
        label: "No Of Days",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noOfPlayers",
        label: "No Of Players",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noOfSubstitutes",
        label: "No Of Substitutes",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    }
];

export const OverInformation = [
    {
        name: "limitedOvers",
        label: "Limited Overs",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "bowlersOversLimited",
        label: "Bowlers Overs Limited",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "oversInDay",
        label: "Overs In Day",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "firstInningsMaxOver",
        label: "1st Innings Max Over",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "secondInningsMaxOver",
        label: "2nd Innings Max Over",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "powerPlay",
        label: "Power Play",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "extraInnings",
        label: "Extra Innings",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "oversInLastHour",
        label: "Overs In Last Hours",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "newBallAfterOver",
        label: "New Ball After Overs",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
]

export const BallInformationFields = [
    {
        name: "ballPerOver",
        label: "Ball Per Overs",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noBallRun",
        label: "No Ball Run",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noBallRunExtra",
        label: "Is Extra Ball",
        parentclassName: "",
        type: COUNTER,
    },
    {
        name: "noBallRunLastOver",
        label: "No Ball Run[Last Over]",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "noBallRunLastOverExtra",
        label: "Is Extra Ball",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "paneltyRunCountPartnership",
        label: "Penalty Run Count [Partnership]",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "frontFootNoBall",
        label: "Front Foot No. Ball Run",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "wideBallRun",
        label: "Wide Ball Run",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "wideBallRunExtra",
        label: "Is Extra Ball",
        parentclassName: "",
        type: COUNTER,
    },
    {
        name: "wideBallRunLastOver",
        label: "Wide Ball Run[Last Over]",
        parentclassName: "",
        type: COUNTER,
        min: 0,
        max: 10,
        step: 1
    },
    {
        name: "wideBallRunLastOverExtra",
        label: "Is Extra Ball",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "wideBallCountPartnership",
        label: "Wide Ball Count [Partnership]",
        parentclassName: "",
        type: SWITCH
    },
]
