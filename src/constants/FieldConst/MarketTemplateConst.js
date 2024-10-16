import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

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
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isOver",
        label: "Over",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "over",
        label: false,
        dependsOnField: "isOver",
        dependsOnValue: true,
        type: TEXT,
        placeholder: "Overs",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "isPlayer",
        label: "Player",
        defaultValue: false,
        type: SWITCH,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "playerName",
        label: false,
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
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "createType",
        label: "Create Type",
        options: [{ label: "Select Create Type", value: "0" },{ label: "Ball", value: 1 }, { label: "Over", value: 2 },{ label: "Wicket", value: 3 },],
        type: SELECT,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "create",
        label:"Create",
        type: TEXT,
        requiredErrorMessage: "Please enter value",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "createRefId",
        label: false,
        dependsOnField: "createType",
        dependsOnValue: 1,
        type: TEXT,
        placeholder: "Create Ref Id",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "autoOpenType",
        label: "Auto Open Type",
        options: [{ label: "Select Auto Open Type", value: "0" },{ label: "Ball", value: 1 }, { label: "Over", value: 2 }, { label: "Wicket", value: 3 },],
        type: SELECT,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "autoOpen",
        label:"Auto Open",
        type: TEXT,
        requiredErrorMessage: "Please enter value",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "openRefId",
        label: false,
        dependsOnField: "autoOpenType",
        dependsOnValue: 1,
        type: TEXT,
        placeholder: "Open Ref Id",
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "autoSuspendType",
        label: "Auto Suspend Type",
        options: [{ label: "Select Auto Suspend Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" }, { label: "Wicket", value: "3" },],
        type: SELECT,
        defaultValue: false,
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
        name: "autoCloseType",
        label: "Auto Close Type",
        options: [{ label: "Select Auto Close Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" }, { label: "Wickets", value: "3" },],
        type: SELECT,
        defaultValue: false,
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
        name: "isBallStart",
        label: "Ball Start",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "actionType",
        label: "Action Type",
        options: [{ label: "Select Action Type", value: "0" }, { label: "winClose", value: "1" }, { label: "winCloseCancel", value: "2" }, { label: "winMustClose", value: "3" }, { label: "winMustCloseCancel", value: "4" }],
        type: SELECT,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isAutoResultSet",
        label: "Auto Result Set",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 1, lg: 1 }
    },
    {
        name: "autoResultType",
        label: false,
        dependsOnField: "isAutoResultSet",
        options: [{ label: "Select Auto Open Type", value: "0" },{ label: "Ball", value: "1" }, { label: "Over", value: "2" }, { label: "Wickets", value: "3" },],
        dependsOnValue: true,
        type: SELECT,
        fieldColspan: { xs: 12, md: 3, lg: 3 }
    },
    {
        name: "autoResultafterBall",
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
        name: "marketTypeId",
        label: "Market Type",
        type: SELECT,
        options: [{ label: "Select a Market Type", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        requiredErrorMessage: "Please enter market type.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "margin",
        label:"Margin",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter margin.",
        regex: /^\d+\.?\d*$/,
        regexErrorMessage: "Please enter only decimal margin.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "marketTypeCategoryId",
        label:"Category",
        type: SELECT,
        options: [{ label: "Select a Category", value: "0" }],
        defaultValue: "0",
        isRequired: true,
        requiredErrorMessage: "Please enter category.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "templateType",
        label: "Template Type",
        options: [
          { label: "Select Template Type", value: "0" },
          { label: "Prematch", value: 1 },
          { label: "Inplay", value: 2 },
          { label: "Prematch & Inplay", value: 3 },
        ],
        isRequired: true,
        type: SELECT,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        type: TEXT,
        name: "delay",
        label: "Market Delay",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
    {
        name: "isDefaultBetAllowed",
        label: "Is Bet Allowed",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isDefaultMarketActive",
        label: "Is Market Active",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isPerEvent",
        label: "Is Per Event",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isShowInAdvanceMarket",
        label: "Is Show Advance Market",
        type: SWITCH,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "isActive",
        label: "Is Active",
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
];