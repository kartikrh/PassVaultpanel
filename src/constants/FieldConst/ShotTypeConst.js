import {
  IMAGE,
  SWITCH,
  TEXT,
} from "../../components/Common/Const";

export const shotTypeFields = [
  {
    name: "name",
    label: "Name",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
    {
    type: IMAGE,
    name: "image",
    label: "Image",
    // customStyle: {
    //     maxWidth: "200px",
    //     paddingLeft:"0px"
    //   },
    labelColspan: { xs: 12, md: 3, lg: 2 },
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