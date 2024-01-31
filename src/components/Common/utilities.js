export const convertObjtoFormData = (obj) => {

    const formData = new FormData();
    for (const key in obj) {
        if(obj[key] || obj[key] === false || obj[key] === 0){
            formData.append(key, obj[key]);
        }
    }
    return formData
}
