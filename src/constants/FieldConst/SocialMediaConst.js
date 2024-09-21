import {
  IMAGE,
  SWITCH,
  TEXT,
} from "../../components/Common/Const";

export const socialMediaField = [
  {
    name: "name",
    label: "Name",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 4, md: 2, lg: 2 },
    fieldColspan: { xs: 8, md: 4, lg: 4 },
  },
  {
    name: "link",
    label: "Link",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 4, md: 2, lg: 2 },
    fieldColspan: { xs: 8, md: 4, lg: 4 },
  },
  {
    type: IMAGE,
    name: "image",
    label: "Image",
    labelColspan: { xs: 2, md: 2, lg: 2 },
    fieldColspan: { xs: 6, md: 6, lg: 6 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Is Active",
    labelColspan: { xs: 2, md: 2, lg: 2 },
    fieldColspan: { xs: 2, md: 2, lg: 2 },
  },
];
