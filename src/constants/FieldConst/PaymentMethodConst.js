import { SWITCH, TEXT, SELECT, TEXT_EDITOR, IMAGE } from "../../components/Common/Const";

// QR-only and BANK-only field names -- AddPaymentMethod.jsx's
// handleFormBDataChange filters these in/out of the visible field list based
// on the current `type` selection, same technique AddPackage.jsx uses for
// isPermanent's startDate/endDate.
export const QR_ONLY_FIELDS = ["qrImageUrl", "upiId"];
export const BANK_ONLY_FIELDS = ["bankName", "accountHolderName", "accountNumber", "ifscCode", "branch"];

export const paymentMethodField = [
  {
    name: "type",
    label: "Type",
    options: [
      { label: "Select Type", value: "0" },
      { label: "QR Code", value: "QR" },
      { label: "Bank Transfer", value: "BANK" },
    ],
    isRequired: true,
    type: SELECT,
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "label",
    label: "Label",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "qrImageUrl",
    label: "QR Image",
    isRequired: true,
    type: IMAGE,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "upiId",
    label: "UPI ID (optional)",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "bankName",
    label: "Bank Name",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "accountHolderName",
    label: "Account Holder Name",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "accountNumber",
    label: "Account Number",
    isRequired: true,
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "ifscCode",
    label: "IFSC / SWIFT Code",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "branch",
    label: "Branch (optional)",
    type: TEXT,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isActive",
    label: "Is Active",
    defaultValue: true,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    type: SWITCH,
    name: "isDefault",
    label: "Is Default (shown to clients)",
    defaultValue: false,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 4, lg: 4 },
  },
  {
    name: "instructions",
    label: "Instructions (optional)",
    type: TEXT_EDITOR,
    labelColspan: { xs: 12, md: 2, lg: 2 },
    fieldColspan: { xs: 12, md: 10, lg: 10 },
  },
];

// Returns the field list visible for the currently-selected type -- QR/BANK
// each hide the other's dedicated fields rather than showing every field at
// once.
export const getPaymentMethodFieldsForType = (type) => {
  const hidden = type === "QR" ? BANK_ONLY_FIELDS : type === "BANK" ? QR_ONLY_FIELDS : [...QR_ONLY_FIELDS, ...BANK_ONLY_FIELDS];
  return paymentMethodField.filter((field) => !hidden.includes(field.name));
};
