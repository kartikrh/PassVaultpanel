import { CONTENT_IMAGE_TYPE, SWITCH, TEXT, TEXT_EDITOR } from "../../components/Common/Const";

export const BlockFields=[
    {
        name: "blockName",
        label: "Block Name",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        regex: /^[a-zA-Z0-9 ]{1,20}$/,
        regexErrorMessage: "Max allowed Characters 20, No Spacial Character",
        requiredErrorMessage: "Please enter Block name.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    
    {
        name: "containerId",
        label: "Container Id",
        parentclassName: "",
        type: TEXT,
        isRequired: true,
        requiredErrorMessage: "Please enter Container Id.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 }
    },
    {
        name: "content",
        label: "Content",
        parentclassName: "",
        type: TEXT_EDITOR,
        isRequired: true,
        imageType: CONTENT_IMAGE_TYPE.BLOCKS,
        requiredErrorMessage: "Please enter Content.",
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 10 }
    },
    {
        name: "isShowContent",
        label: "Is Show Contain",
        defaultValue: true,
        parentclassName: "",
        type: SWITCH,
    },
]