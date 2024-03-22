import { DATE_TIME_PICKER, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const EventMarketFields = [
    {
        type: DATE_TIME_PICKER,
        name: "eventDate",
        label: "Event Date",
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "eventMarketId",
        label: "Event Market Id",
        isRequired: true,
        regexErrorMessage: "Please Enter Event Market Id",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "eventTypeName",
        label: "Event Name",
        regex: /^[a-zA-Z0-9 ]{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },

    {
        type: TEXT,
        name: "competitionName",
        label: "Competition",
        regex: /^[a-zA-Z0-9 ]{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "eventName",
        label: "Event",
        regex: /^[a-zA-Z0-9 ]{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: TEXT,
        name: "marketName",
        label: "Market",
        regex: /^[a-zA-Z0-9 ]{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100, No Spacial Character",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SELECT,
        name: "statusType",
        label: "Status",
        options: [{ label: "NotOpen", value: 0 }, { label: "Open", value: 1 },{ label: "Inactive", value: 2 },{ label: "Suspend", value: 3 },{ label: "Close", value: 4 },{ label: "Settled", value: 5 },{ label: "Cancel", value: 6 }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SWITCH,
        name: "isAllow",
        label: "Is Allow",
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        type: SWITCH,
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    }, 
]