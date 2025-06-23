export const convertObjtoFormData = (obj) => {

    const formData = new FormData();
    for (const key in obj) {
        if(obj[key] || obj[key] === false || obj[key] === 0){
            formData.append(key, obj[key]);
        }
    }
    return formData
}

export const convertObjtoFormData2 = (obj) => {
  const formData = new FormData();
  for (const key in obj) {
    if (key === 'tpId') {
      formData.append(key, obj[key] === null ? "" : obj[key]);
    } else if (obj[key] || obj[key] === false || obj[key] === 0) {
      formData.append(key, obj[key]);
    }
  }
  return formData;
}