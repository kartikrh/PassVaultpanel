import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const UserFields = [
    {
        name: "parentName",
        label: "Parent Name",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Select a Parent Name", value: "Select a Parent Name" },
        options: [
            { label: "Parent1", value: "Parent1" },
            { label: "Parent2", value: "Parent2" },],
        isRequired: true,
        requiredErrorMessage: "Please select a parent name.",
    },
    {
        name: "userType",
        label: "User Type",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Select a Role", value: "Select a Display Type" },
        options: [
            { label: "Admin", value: "Admin" },
            { label: "Agent", value: "Agent" },
            { label: "Client", value: "Client" },],
        isRequired: true,
        requiredErrorMessage: "Please select a user type.",
    },
    {
        name: "role",
        label: "Role",
        parentclassName: "",
        type: SELECT,
        defaultOption: { label: "Select a Role", value: "Select a Role" },
        options: [
            { label: "Super Admin", value: "Super Admin" }],
        isRequired: true,
        requiredErrorMessage: "Please select a role.",
    },
    {
        name: "fullName",
        label: "Full Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter full name.",
    },
    {
        name: "username",
        label: "User Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter user name.",
    },
    {
        name: "password",
        label: "Password",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter password.",
    },
    {
        name: "mobile",
        label: "Mobile",
        parentclassName: "",
        type: TEXT,
        regex: /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        regexErrorMessage: "Invalid mobile number",
    },
    {
        name: "allowMultipleLogin",
        label: "Allow Multiple Login",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    },
]