import {
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
    name: "imagePath",
    label: "Image Path",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isDemoClientEnableInIOS",
    label: "Demo IOS",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  // {
  //   type: SWITCH,
  //   name: "isDemoClientLogin",
  //   label: "Demo Login",
  //   defaultValue: false,
  //   labelColspan: { xs: 12, md: 2, lg: 2 },
  //   fieldColspan: { xs: 12, md: 4, lg: 4 },
  // },
  {
    type: SWITCH,
    name: "isActive",
    label: "Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
