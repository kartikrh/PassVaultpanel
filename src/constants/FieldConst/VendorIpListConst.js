import { BUTTON, SWITCH, TEXT } from "../../components/Common/Const";

export const VendorIpListFileds = [
    {
        name: "ipAddress",
        label:"Ip Address",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter ipAddress.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 2, lg: 2 }
    },
    {
        name: "isActive",
        label: "IsActive",
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "generate",
        type: BUTTON,
        btnLable:"Update",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 2 }
    },
];