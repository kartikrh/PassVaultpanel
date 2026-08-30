import { SELECT, SWITCH, TEXT } from "../../components/Common/Const";

export const WhiteLabelField = [
  {
    name: "domain",
    label: "Domain",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "imagePath",
    label: "Image",
    type: TEXT,
    accept: "image/*",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },

  // reCAPTCH Settings
  {
    type: SWITCH,
    name: "isRecatchEnable",
    label: "Enable reCATCH",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "recatchKey",
    label: "reCATCH Key",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isRecatchEnable",
    dependsOnValue: true,  },

  // Google Login Settings
  {
    type: SWITCH,
    name: "isGoogleLogin",
    label: "Enable Google Login",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    // Wide on purpose: this toggle alone fills the row, so Google Client
    // ID/Secret below always start together at the left edge of the next
    // row (left/right pair) instead of sharing a row with this switch.
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
  {
    name: "googleKey",
    label: "Google Client ID",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter the Google Client ID.",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isGoogleLogin",
    dependsOnValue: true,
    // Fully removed from the form (not just visually hidden) when Google
    // Login is off, so the row disappears instead of leaving a blank gap.
    hideDependentInitially: true,
  },
  {
    name: "googleSecret",
    label: "Google Client Secret",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter the Google Client Secret.",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isGoogleLogin",
    dependsOnValue: true,
    hideDependentInitially: true,
  },

  {
    name: "clientOTP",
    label: "Client OTP",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isDemoClientLogin",
    label: "Demo Android",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isDemoClientEnableInIOS",
    label: "Demo IOS",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "mailSettingId",
    label: "Mail Setting",
    type: SELECT,
    defaultValue: "0",
    options: [{ label: "None", value: 0 }],
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
