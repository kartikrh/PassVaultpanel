import { COUNTER, DIVIDER, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const MarketTemplateFileds = [
    {
        name: "matchTypeID",
        label: "Match Type",
        type: SELECT,
        isRequired: true,
        options: [{ label: "Select MatchType", value: "0" }],
        requiredErrorMessage: "Please enter name.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "templateName",
        label: "Template Name",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Template Name Is Missing",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isPredefineMarket",
        label: "Predefine Market",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isPreMatchOnly",
        label: "PreMatch Only",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isPreMatchMarket",
        label: "PreMatch Market",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isOver",
        label: "Over",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "over",
        label:false,
        dependsOnField: "isOver",
        dependsOnValue: true,
        type: TEXT,
        placeholder: "Overs",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "isPlayer",
        label: "Player",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "playerName",
        label:false,
        dependsOnField: "isPlayer",
        dependsOnValue: true,
        type: TEXT,
        placeholder: "Player Name",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "isAutoCancel",
        label: "Auto Cancel",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "autoOpenType",
        label: "Auto Open Type",
        options: [{ label: "Select Auto Open Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" },],
        type: SELECT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "autoOpen",
        label:"Auto Open",
        type: TEXT,
        requiredErrorMessage: "Please enter value",
        regex: /^(10|[0-9]|[1-9][0-9]{0,2}|1000)?$/,
        regexErrorMessage: "over Should be Between 0 to 1000",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "autoCloseType",
        label: "Auto Close Type",
        options: [{ label: "Select Auto Close Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" },],
        type: SELECT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "beforeAutoClose",
        label:"Before Auto Close",
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "autoSuspendType",
        label: "Auto Suspend Type",
        options: [{ label: "Select Auto Suspend Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" },],
        type: SELECT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "beforeAutoSuspend",
        label:"Before Auto Suspend",
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isBallStart",
        label: "Ball Start",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 10 }
    },
    {
        name: "isAutoResultSet",
        label: "Auto Result Set",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "autoResultType",
        label:false,
        dependsOnField: "isAutoResultSet",
        dependsOnValue: true,
        type: TEXT,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
        {
        name: "autoResultAfterBall",
        label:"Auto Result After Ball",
        dependsOnField: "isAutoResultSet",
        dependsOnValue: true,
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "afterWicketAutoSuspend",
        label:"After Wicket Auto Suspend",
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        name: "afterWicketNotCreated",
        label:"After Wicket Not Created",
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isActive",
        label: "IsActive",
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
];