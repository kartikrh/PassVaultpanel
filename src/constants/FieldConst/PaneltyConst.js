import { SWITCH, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const PaneltyRunConst = [
    {
        name: "runs",
        label: "Runs",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter runs.",
    },
    {
        name: "description",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        isRequired: true,
        requiredErrorMessage: "Please enter description.",
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    },
]