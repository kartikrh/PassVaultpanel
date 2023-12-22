import { SWITCH, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const PaneltyRunConst = [
    {
        name: "run",
        label: "Runs",
        parentclassName: "",
        type: TEXT,
        regex: /^\d+$/,
        isRequired: true,
        requiredErrorMessage: "Please enter runs.",
        labelColspan: { xs: 12, md: 4, lg: 3 },
        fieldColspan: { xs: 12, md: 8, lg: 9 }
    },
    {
        name: "desc",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        isRequired: true,
        requiredErrorMessage: "Please enter description.",
        labelColspan: { xs: 12, md: 4, lg: 3 },
        fieldColspan: { xs: 12, md: 8, lg: 9 }
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        defaultValue: true,
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 12, md: 4, lg: 3 },
        fieldColspan: { xs: 12, md: 8, lg: 9 }
    },
]