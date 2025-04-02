import {
  IMAGE,
  TEXT,
} from "../../components/Common/Const";

export const countryCodeField = [
  {
    name: "countryCode",
    label: "Country Code",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "countryName",
    label: "Country Name",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: IMAGE,
    name: "flag",
    label: "Flag",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
