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
export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_SECRET);
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decrypted;
};

export const removeStorageToken = () => {
  const authData = localStorage.getItem("authUser");
  const data = decryptData(authData);
  delete data?.result?.token
  localStorage.setItem("authUser", encryptData(data))
}