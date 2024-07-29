import { SELECT, SWITCH, TEXT, TEXT_EDITOR } from "../../components/Common/Const";

export const TemplateConst = [
  {
    name: "templateType",
    label: "Template Type",
    options: [
      { label: "Select Template Type", value: "0" },
      { label: "MobileNo", value: 1 },
      { label: "Email", value: 2 },
    ],
    isRequired: true,
    type: SELECT,
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "type",
    label: "Type",
    options: [{ label: "Select Type", value: "0" }],
    isRequired: true,
    type: SELECT,
    defaultValue: "0",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "title",
    label: "Title",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter Title.",
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
  {
    name: "description",
    label: "Message",
    parentclassName: "",
    type: TEXT_EDITOR,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
];
