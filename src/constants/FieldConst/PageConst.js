import { IMAGE, SWITCH, TEXT, TEXT_AREA } from "../../components/Common/Const";

export const PageFields=[
    {
        name: "pageFormatName",
        label: "Page Format Name",
        parentclassName: "",
        isRequired: true,
        regex: /^.{1,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        type: TEXT,
    },
    {
        name: "image",
        label: "Image",
        parentclassName: "",
        type: IMAGE
    },
    {
        name: "pageName",
        label: "Page Name",
        parentclassName: "",
        regex: /^.{0,100}$/,
        regexErrorMessage: "Max allowed Characters 100",
        isRequired: true,
        type: TEXT,
    },
    {
        name: "description",
        label: "Description",
        parentclassName: "",
        type: TEXT_AREA,
        defaultRows: 3,
        regex: /^.{0,500}$/,
        regexErrorMessage: "Max allowed Characters 500",
    },
    {
        name: "isActive",
        label: "Is Active",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH
    },
]