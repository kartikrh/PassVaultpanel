import {
    DATE_TIME_PICKER,
    IMAGE,
    SWITCH,
    TEXT,
    TEXT_EDITOR,
  } from "../../components/Common/Const";
  
  export const photoLibraryFields = [
    // {
    //   name: "tags",
    //   label: "Tag",
    //   isRequired: true,
    //   type: TEXT,
    //   labelColspan: { xs: 12, md: 2, lg: 2 },
    //   fieldColspan: { xs: 12, md: 10, lg: 10 },
    // },
    {
      name: "title",
      label: "Title",
      isRequired: true,
      type: TEXT,
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 10, lg: 10 },
    },
    {
      name: "SEO",
      label: "SEO",
      isRequired: true,
      type: TEXT,
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 10, lg: 10 },
    },
    {
      name: "description",
      label: "Description",
      isRequired: true,
      type: TEXT,
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 10, lg: 10 },
    },
    {
      type: SWITCH,
      name: "isPermanent",
      label: "IsPermanent",
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 10, lg: 10 },
    },
    // {
    //   type: SWITCH,
    //   name: "isActive",
    //   label: "IsActive",
    //   defaultValue: true,
    //   labelColspan: { xs: 12, md: 2, lg: 2 },
    //   fieldColspan: { xs: 12, md: 4, lg: 4 },
    // },
    {
      name: "startDate",
      label: "From",
      isRequired: true,
      // customStyle: {
      //   maxWidth: "600px",
      // },
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 4, lg: 4 },
      type: DATE_TIME_PICKER,
    },
    {
      name: "endDate",
      label: "To",
      isRequired: true,
      // customStyle: {
      //   maxWidth: "600px",
      // },
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 4, lg: 4 },
      type: DATE_TIME_PICKER,
    },
      
  ];
  export const photoFields = [
    // {
    //   name: "tags",
    //   label: "Tag",
    //   isRequired: true,
    //   type: TEXT,
    //   labelColspan: { xs: 12, md: 2, lg: 2 },
    //   fieldColspan: { xs: 12, md: 10, lg: 10 },
    // },
    {
      name: "title",
      label: "Title",
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
      fieldColspan: { xs: 12, md: 9, lg: 10 },
    },
    {
      type: SWITCH,
      name: "isDefault",
      label: "IsDefault",
      labelColspan: { xs: 12, md: 2, lg: 2 },
      fieldColspan: { xs: 12, md: 4, lg: 4 },
    },
      
  ];
  
  