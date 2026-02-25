import { SELECT, TEXT, TEXT_AREA, SWITCH } from "../../components/Common/Const";

export const RoleFields = [
    {
        name: "displayType",
        label: "Display Type",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Select Display For", value: "Select Display For" },
        options: [
            { label: "Admin", value: 1 },
            { label: "Agent", value: 2 },
            // { label: "Client", value: 3 },
            // { label: "Support", value: 4 }
        ],
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
        regex: /^[^']{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial(') Character",
    },
    {
        name: "description",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        defaultRows: 3,
        regex: /^.{0,500}$/,
        regexErrorMessage: "Max allowed Characters 500",
    },
    {
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
    },
]