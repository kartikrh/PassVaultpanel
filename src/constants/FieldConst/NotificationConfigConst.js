import {
  SELECT,
  SWITCH,
  TEXT,
} from "../../components/Common/Const";

export const notificationConfigField = [
  {
    name: "eventName",
    label: "Event",
    options: [
      { label: "Select Event", value: "0" },
      { label: "Comming Soon", value: 1 },
      { label: "Win Toss", value: 2 },
      { label: "Event Start", value: 3 },
      { label: "Inning Completed", value: 4 },
      { label: "Boundary", value: 5 },
      { label: "Wicket", value: 6 },
      { label: "Event Completed", value: 7 },
    ],
    isRequired: true,
    type: SELECT,
    defaultValue: "0",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "content",
    label: "Content",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Is Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
