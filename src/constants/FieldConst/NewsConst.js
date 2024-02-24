import {
  DATE_TIME_PICKER,
  IMAGE,
  MULTI_SELECT,
  SELECT,
  SWITCH,
  TEXT,
  TEXT_EDITOR,
} from "../../components/Common/Const";

export const newsFields = [
  {
    name: "title",
    label: "Title",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 3, lg: 2 },
    fieldColspan: { xs: 12, md: 9, lg: 9 },
  },
  {
    type: SWITCH,
    name: "isPermanent",
    label: "IsPermanent",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "IsActive",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "startDate",
    label: "From",
    isRequired: true,
    customStyle: {
      maxWidth: "600px",
    },
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    type: DATE_TIME_PICKER,
  },
  {
    name: "endDate",
    label: "To",
    isRequired: true,
    customStyle: {
      maxWidth: "600px",
    },
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    type: DATE_TIME_PICKER,
  },
    {
    type: IMAGE,
    name: "image",
    label: "Image",
    customStyle: {
        maxWidth: "200px",
        border:"solid green 2px"
      },
    labelColspan: { xs: 12, md: 3, lg: 2 },
    fieldColspan: { xs: 12, md: 9, lg: 10 },
  },
  {
    name: "news",
    label: "News",
    parentclassName: "",
    type: TEXT_EDITOR,
    labelColspan: { xs: 12, md: 3, lg: 2 },
    fieldColspan: { xs: 12, md: 9, lg: 9 },
  },
];
