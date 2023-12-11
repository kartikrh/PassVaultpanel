import { DATE_TIME_PICKER, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const EventFields = [
    {
        name: "eventType",
        label: "Event Type",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "competition",
        label: "Competition",
        parentclassName: "",
        type: SELECT,
    },
    {
        name: "eventName",
        label: "Event Name",
        parentclassName: "",
        type: TEXT,
    },
    {
        name: "referenceId",
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
        name: "timezone",
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