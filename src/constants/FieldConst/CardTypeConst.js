import { CONTENT_IMAGE_TYPE, IMAGE, SELECT, SWITCH, TEXT, TEXT_EDITOR } from "../../components/Common/Const";

export const CardTypeFields=[
    {
        name: "enum",
        label: "Card Type",
        options: [
          { label: "Select Module Type", value: "0" },
          { label: "Hearts", value: 1 },
          { label: "Diamonds", value: 2 },
          { label: "Clubs", value: 3 },
          { label: "Spades", value: 4 },
        ],
        isRequired: true,
        type: SELECT,
        defaultValue: false,
        labelColspan: { xs: 12, md: 2, lg: 2 },
        fieldColspan: { xs: 12, md: 4, lg: 4 },
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
        name: "image",
        label: "Image",
        parentclassName: "",
        type: IMAGE
    },
]