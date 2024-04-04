import { SWITCH, TEXT } from "../../components/Common/Const";

export const DisplayStatusConst = [
  {
    name: "displayStatus",
    label: "Display Status",
    parentclassName: "",
    type: TEXT,
    regex: /^.{0,100}$/,
    regexErrorMessage: "Max allowed Characters 100",
    isRequired: true,
    customStyle: {
      maxWidth: "200px",
    },
    requiredErrorMessage: "Please enter DisplayStatus.",
    labelColspan: { xs: 12, md: 3, lg: 3 },
    fieldColspan: { xs: 12, md: 9, lg: 9 },
  },
  {
    name: "isActive",
    label: "Is Active",
    parentclassName: "",
    defaultValue: true,
    type: SWITCH,
    labelColspan: { xs: 12, md: 3, lg: 3 },
    fieldColspan: { xs: 12, md: 9, lg: 9 },
  },
];
