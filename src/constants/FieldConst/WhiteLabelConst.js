import {
  IMAGE,
  SWITCH,
  TEXT,
} from "../../components/Common/Const";

export const WhiteLabelField = [
  {
    name: "domain",
    label: "Domain",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isDemoClientEnableInIOS",
    label: "Is Demo Client Enable In IOS",
    defaultValue: false,
    labelColspan: { xs: 12, md: 3, lg: 3 },
    fieldColspan: { xs: 12, md: 3, lg: 3 },
  },
  {
    type: IMAGE,
    name: "imagePath",
    label: "Image",
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
