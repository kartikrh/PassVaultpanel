import {decryptData} from './../../Pages/Utility/encryptionUtils'
export default function authHeader() {

  const obj = decryptData(localStorage.getItem("authUser"))

  if (obj && obj.accessToken) {
    return { Authorization: obj.accessToken }
  } else {
    return {}
  }
}
