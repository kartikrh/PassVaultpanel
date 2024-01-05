import { SWITCH, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const PaneltyRunConst = [
    {
        name: "run",
        label: "Runs",
        parentclassName: "",
        type: TEXT,
        regex: /^\d+$/,
        regexErrorMessage: "Invalid number of runs",
        isRequired: true,
        customStyle: {
            maxWidth: "200px",
        },
        requiredErrorMessage: "Please enter runs.",
        labelColspan: { xs: 12, md: 3, lg: 3 },
        fieldColspan: { xs: 12, md: 9, lg: 9 }
    },
    {
        name: "desc",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        defaultRows: 3,
        isRequired: true,
        requiredErrorMessage: "Please enter description.",
        regex: /^.{0,50}$/,
        regexErrorMessage: "Max allowed Characters 50",
        labelColspan: { xs: 12, md: 3, lg: 3 },
        fieldColspan: { xs: 12, md: 9, lg: 9 }
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        defaultValue: true,
        type: SWITCH,
        labelColspan: { xs: 12, md: 3, lg: 3 },
        fieldColspan: { xs: 12, md: 9, lg: 9 }
    },
]