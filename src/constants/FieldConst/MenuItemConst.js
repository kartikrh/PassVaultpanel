import { IMAGE, SELECT, SWITCH, TEXT, TEXT_AREA, TEXT_EDITOR, RADIO_BUTTON } from "../../components/Common/Const";

export const menuItemFields = [
   {
    name: "menuTypeId",
    label: "main",
    options: [{ label: "Select a Block", value: "0" }],
    type: SELECT,
    isRequired: true,
    // labelColspan: { xs: 12, md: 2, lg: 2 },
    // fieldColspan: { xs: 12, md: 10, lg: 10 }
},
{
    name: "menuItemId",
    label: "parent",
    options: [{ label: "Select a Block", value: "0" }],
    type: SELECT,
    isRequired: true,
    // labelColspan: { xs: 12, md: 2, lg: 2 },
    // fieldColspan: { xs: 12, md: 10, lg: 10 }
},
{
    name: "name",
    label: "Name",
    options: [{ label: "Select a Block", value: "0" }],
    type: SELECT,
    isRequired: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 }
},
{
    name: "isActive",
    label: "IsActive",
    defaultValue: true,
    parentclassName: "",
    type: SWITCH,
    // labelColspan: { xs: 12, md: 2 },
    // fieldColspan: { xs: 12, md: 4 }
},
{
    name: "createPage",
    label: "Create Page",
    defaultValue: true,
    parentclassName: "",
    type: SWITCH,
    // labelColspan: { xs: 12, md: 2 },
    // fieldColspan: { xs: 12, md: 4 }
},
{
    name: "isActive1",
    label: "Create New Page",
    defaultValue: true,
    parentclassName: "",
    type: RADIO_BUTTON,
    // labelColspan: { xs: 12, md: 2 },
    // fieldColspan: { xs: 12, md: 4 }
},
{
    name: "isActive1",
    label: "Use Existing Page",
    defaultValue: true,
    parentclassName: "",
    type: RADIO_BUTTON,
    // labelColspan: { xs: 12, md: 2 },
    // fieldColspan: { xs: 12, md: 4 }
},
]

export const menuItemPageDetials = [    
    {
        name: "seoWord",
        label: "SEO Word",
        parentclassName: "",
        regex: /^.{0,500}$/,
        defaultRows: 3,
        regexErrorMessage: "Max allowed Characters 500",
        type: TEXT_AREA,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "seoDescription",
        label: "SEO Description",
        parentclassName: "",
        type: TEXT_AREA,
        defaultRows: 3,
        regex: /^.{0,500}$/,
        regexErrorMessage: "Max allowed Characters 500",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "isLink",
        label: "Is Link",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
        // labelColspan: { xs: 12, md: 2 },
        // fieldColspan: { xs: 12, md: 4 }
    },
    {
        name: "isOpenInNewTab",
        label: "Open In New Tab",
        defaultValue: true,
        dependsOnField: "isLink",
        dependsOnValue: true,
        parentclassName: "",
        type: SWITCH,
        // labelColspan: { xs: 12, md: 2 },
        // fieldColspan: { xs: 12, md: 4 }
    },
    {
        name: "linkURL",
        label: "Link URL",
        parentclassName: "",
        dependsOnField: "isLink",
        dependsOnValue: true,
        isRequired: true,
        type: TEXT,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "pageFormatId",
        label: "Page Format",
        dependsOnField: "isLink",
        dependsOnValue: false,
        options: [{ label: "Select a Page Format", value: "0" }],
        parentclassName: "",
        type: SELECT,
        isRequired: true,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "isStatic",
        label: "Is Static",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
        // labelColspan: { xs: 12, md: 2 },
        // fieldColspan: { xs: 12, md: 4 }
    },
    {
        name: "isDefault",
        label: "Is Default",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
        // labelColspan: { xs: 12, md: 2 },
        // fieldColspan: { xs: 12, md: 4 }
    },
    {
        name: "pageContent",
        label: "Page Content",
        parentclassName: "",
        type: TEXT_EDITOR,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
]