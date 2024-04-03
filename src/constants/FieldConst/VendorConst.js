import { DATE_TIME_PICKER, SWITCH, TEXT } from "../../components/Common/Const";

export const VendorFields = [
    {
        name: "name",
        label: "Vendor Name",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Vendor Name",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "expiryDate",
        label: "Expiry Date",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
        type: DATE_TIME_PICKER,
    },
    {
        name: "isActive",
        label: "IsActive",
        type: SWITCH,
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
];