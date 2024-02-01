import { IMAGE, SELECT, SWITCH, TEXT, TEXT_AREA, TEXT_EDITOR } from "../../components/Common/Const";

export const PageFields = [
    {
        name: "pageName",
        label: "Page Name",
        parentclassName: "",
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        isRequired: true,
        type: TEXT,
        // labelColspan: { xs: 12, md: 2, lg: 2 },
        // fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "pageTitle",
        label: "Page Browse Title",
        parentclassName: "",
        isRequired: true,
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
        // labelColspan: { xs: 12, md: 2, lg: 2 },
        // fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "pageHeading",
        label: "Page Header",
        parentclassName: "",
        isRequired: true,
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
        // labelColspan: { xs: 12, md: 2, lg: 2 },
        // fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "alias",
        label: "Page Alias",
        parentclassName: "",
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        isRequired: true,
        type: TEXT,
        // labelColspan: { xs: 12, md: 2, lg: 2 },
        // fieldColspan: { xs: 12, md: 10, lg: 10 }
    },
    {
        name: "dynamicParameters",
        label: "Page Dynamic Parameters",
        parentclassName: "",
        type: TEXT_EDITOR,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 10, lg: 10 }
    },

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