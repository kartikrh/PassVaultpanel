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
    labelColspan: { xs: 12, md: 1, lg: 1 },
    fieldColspan: { xs: 12, md: 2, lg: 2 },
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
    fieldColspan: { xs: 12, md: 2, lg: 2 },
  },
  {
    name: "generate",
    type: BUTTON,
    btnLable:"Generate",
    action: "GENERATE",
    isRequired: true,
    labelColspan: { xs: 12, md: 1, lg: 1 },
    fieldColspan: { xs: 12, md: 1, lg: 1 }
  },
  {
    name: "importPredictor",
    type: BUTTON,
    btnLable: "Import",
    action: "IMPORT",
    isFileButton: true,
    labelColspan: { xs: 12, md: 1, lg: 1 },
    fieldColspan: { xs: 12, md: 1, lg: 1 },
  },
  {
    name: "exportPredictor",
    type: BUTTON,
    btnLable: "Export",
    action: "EXPORT",
    labelColspan: { xs: 12, md: 1, lg: 1 },
    fieldColspan: { xs: 12, md: 1, lg: 1 },
  },
];
