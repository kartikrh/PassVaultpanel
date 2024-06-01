import { BUTTON, TEXT } from "../../components/Common/Const";

export const MarketTemplateRunnerFileds = [
    {
        name: "runner",
        label: "Runner",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter runner.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "line",
        label: "Line",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter line.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "overRate",
        label: "Over Rate",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter overRate.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "underRate",
        label: "Under Rate",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter underRate.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "backPrice",
        label: "Yes Rate",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter yesRate.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "backSize",
        label: "Yes Point",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter yesPoint.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "layPrice",
        label: "No Rate",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter noRate.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "laySize",
        label: "No Point",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter noPoint.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "generate",
        type: BUTTON,
        btnLable: "Update",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 2 }
    },
];