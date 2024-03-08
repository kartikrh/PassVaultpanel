import { DIVIDER, TEXT, TEXT_BUTTON, BUTTON } from "../../components/Common/Const";

export const MatchTypePredictorFields = [
  {
    name: "oversPerInings",
    label: "Overs",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter Over",
    // regex: /^.{1,20}$/,
    // regexErrorMessage: "Max allowed Characters 20",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 2 },
  },
  {
    name: "balls",
    label: "Balls Per Over",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter Balls per over",
    // regex: /^.{1,20}$/,
    // regexErrorMessage: "Max allowed Characters 20",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 2 },
  },
  {
    name: "generate",
    type: BUTTON,
    btnLable:"Generate",
    isRequired: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 2 }
},
];
