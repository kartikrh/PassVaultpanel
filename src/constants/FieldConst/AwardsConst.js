import {
  SWITCH,
  TEXT,
} from "../../components/Common/Const";

export const awardField = [
  {
    name: "name",
    label: "Name",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Is Active",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isShowOnSummary",
    label: "Show on summary",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
