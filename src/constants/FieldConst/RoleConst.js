import { SELECT, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const RoleFields = [
    {
        name: "diplayType",
        label: "Display Type",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Select Display For", value: "Select Display For" },
        options: [
            { label: "Admin", value: "Admin" },
            { label: "Agent", value: "Agent" },],
        isRequired: true,
        requiredErrorMessage: "Please Select Display Type.",
    },
    {
        name: "roleName",
        label: "Role Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter role name.",
    },
    {
        name: "description",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
    },
]