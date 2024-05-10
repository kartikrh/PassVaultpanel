import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const APIConst = [
  {
    name: "type",
    label: "Type",
    options: [
      { label: "Select Type", value: "0" },
      { label: "clientAPI", value: 1 },
      { label: "dataProviderAPI", value: 2 },
    ],
    isRequired: true,
    type: SELECT,
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "api",
    label: "API",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter API.",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "isActive",
    label: "Is Active",
    parentclassName: "",
    defaultValue: true,
    type: SWITCH,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
