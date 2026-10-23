import CryptoJS from "crypto-js";

const ENCRYPTION_SECRET = process.env.REACT_APP_ENCRYPTION_SECRET;

// Encrypt data and return the encrypted string
export const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      ENCRYPTION_SECRET
    ).toString();
    return encrypted;
  } catch (e) { }
};

// Decrypt data and return the decrypted object
// Returns null for missing/stale/undecryptable storage (e.g. after the
// secret changes) instead of throwing and crashing the app on load.
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
};

export const removeStorageToken = () => {
  const data = decryptData(localStorage.getItem("authUser"));
  if (!data) {
    localStorage.removeItem("authUser");
    return;
  }
  delete data.token;
  localStorage.setItem("authUser", encryptData(data))
}