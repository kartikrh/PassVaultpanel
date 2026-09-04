import { IMAGE, SELECT, SWITCH, TEXT } from "../../components/Common/Const";

// Every field below uses the same half-row span (label:2 + field:4 = 6 of 12
// columns), so FormBuilder's single continuous grid naturally packs them two
// per row -- the same left/right pairing as Banner's Add page. Any dependent
// field uses hideDependentInitially so it's fully removed from the grid (not
// just visually hidden) while its toggle is off -- a partially-hidden field
// would still reserve its column and throw off every pair that follows it.
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
    type: SWITCH,
    name: "isActive",
    label: "Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },

  // Google Login Settings
  {
    type: SWITCH,
    name: "isGoogleLogin",
    label: "Enable Google Login",
    defaultValue: false,
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
    name: "googleKey",
    label: "Google Client ID",
    type: TEXT,
    isRequired: true,
    requiredErrorMessage: "Please enter the Google Client ID.",
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isGoogleLogin",
    dependsOnValue: true,
    hideDependentInitially: true,
  },
  {
    name: "recatchKey",
    label: "reCATCH Key",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isRecatchEnable",
    dependsOnValue: true,
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
    name: "recatchSecret",
    label: "reCATCH Secret Key",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
    dependsOnField: "isRecatchEnable",
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

  // Branding -- last, same as Banner's own Image field, which pairs with
  // whatever half-row field lands next to it.
  {
    name: "logo",
    label: "Logo",
    type: IMAGE,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "favicon",
    label: "Favicon",
    type: IMAGE,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
];
