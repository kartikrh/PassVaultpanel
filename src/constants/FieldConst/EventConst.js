import { DATE_TIME_PICKER, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const EventFields = [
    {
        name: "eventId",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
        options: [{ label: "Select Event Type", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "competitionId",
        label: "Competition",
        parentclassName: "",
        type: SELECT,
        options: [{ label: "Select a Competition", value: "0" }],
        defaultValue: "0",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "eventName",
        label: "Event Name",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "refId",
        label: "Reference Id",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "isActive",
        label: "Is Active",
        parentclassName: "",
        type: SWITCH
    },
    {
        name: "countryCode",
        label: "Country Code",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "timeZone",
        label: "TimeZone",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "venue",
        label: "Venue",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "dateAndTime",
        label: "Date And Time",
        parentclassName: "",
        type: DATE_TIME_PICKER,
    },
]