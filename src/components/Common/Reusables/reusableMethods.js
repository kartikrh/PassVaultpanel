import _ from "lodash";
import moment from "moment";

export const sanitizeFormData = (data) => {
  let sanitizedData = { ...data }; // Copy the original formData

  // Loop through each key in the data
  for (let key in sanitizedData) {
    if (
      sanitizedData[key] &&
      typeof sanitizedData[key] === "object" &&
      "value" in sanitizedData[key]
    ) {
      sanitizedData[key] = sanitizedData[key].value;
    }
  }
  return sanitizedData;
};

export const transformPermissionData = (data) => {
  const transformedObject = {};
  data.forEach(tab => {
    const { tabName, isView, isEdit, isAdd, isDelete } = tab;
    transformedObject[tabName] = {
      isView,
      isEdit,
      isAdd,
      isDelete,
    };
  });
  return transformedObject;
}

export const filterAutofillData = (autofill, data) => {
  return autofill.reduce((acc, key) => {
    if (data[key]) {
      acc[key] = data[key];
    }
    return acc;
  }, {});
};

export const isValueEmpty = (value, isDropdown = false) => {
  // Check for null or undefined
  if (value === null || value === undefined) {
    return true;
  }

  // Check for numbers
  if (typeof value === "number") {
    return value <= 0; // Numbers are considered empty if they are 0 or negative
  }

  // Use Lodash's isEmpty for other types
  return (isDropdown && value === "0") || _.isEmpty(value);
};
export const transformApiDataToSidebarData = (apiData) => {
  const SidebarData = [];

  // First, add main menu items to SidebarData
  apiData.forEach(item => {
    if ((item.parentId === "0" || !item.parentId) && item.isActive && item.isView) {
      SidebarData.push({
        label: item.displayName,
        icon: item.iconName,
        url: item.webPage,
        displayOrder: item.displayOrder,
        isMainMenu: true,
        encryptedTabId: item.encryptedTabId, // Add encryptedTabId to identify parents
        subItem: []
      });
    }
  });

  // Then, add sub-items to their respective parent items
  apiData.forEach(item => {
    if (item.parentId && item.parentId !== "0" && item.isActive && item.isView) {
      let parentItem = SidebarData.find(parent => parent.encryptedTabId === item.parentId);
      if (parentItem) {
        parentItem.subItem.push({
          sublabel: item.displayName,
          displayOrder: item.displayOrder,
          link: item.webPage,
          icon: item.iconName
        });
      }
    }
  });

  // Remove encryptedTabId from final output
  SidebarData.forEach(item => delete item.encryptedTabId);

  return SidebarData;
};

export const convertDateLocalToUTC = (localDate) => {
  if (localDate) {
    return moment(localDate).utc().format();
  }
  return "";
}

export const convertDateUTCToLocal = (UTCDate, page, format) => {
  if (UTCDate) {
    if (page === 'index') {
      return moment(UTCDate).local().format("DD/MM/YY, h:mm:ss a");
    }
    if (format) return moment(UTCDate).local().format(format);
    return moment(UTCDate).local().format("YYYY-MM-DDTHH:mm:ss");
  }
  return "";
}

export const convertDateUTCToLocal2 = (UTCDate, page, format) => {
  if (UTCDate) {
    if (page === 'index') {
      // Format with milliseconds
      return moment(UTCDate).local().format("DD/MM/YY, h:mm:ss.SSS a");
    }
    if (format) {
      // Format with milliseconds
      return moment(UTCDate).local().format(`${format}.SSS`);
    }
    // Default format with milliseconds
    return moment(UTCDate).local().format("YYYY-MM-DDTHH:mm:ss.SSS");
  }
  return "";
}

export const convertDateUTCToLocalWithoutSec = (UTCDate, page, format) => {
  if (UTCDate) {
    if (page === 'index') {
      return moment(UTCDate).local().format("DD/MM/YY, h:mm a"); // Removed seconds
    }
    if (format) return moment(UTCDate).local().format(format.replace("ss", "")); // Removes seconds if present in custom format
    return moment(UTCDate).local().format("YYYY-MM-DDTHH:mm"); // Removed seconds
  }
  return "";
}

export const convertDateString = (dateString) => {
  if (dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if the date is valid
      return "Invalid Date";
    }
    // Extract the date and time in ISO format, then remove the seconds and timezone
    return date.toISOString().replace(/:\d{2}\.\d{3}Z$/, '');
  }
  return "";
}

export function compareNumStringValues(value1, value2) {
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return value1 === value2;
  }

  const numValue1 = parseFloat(value1);
  const numValue2 = parseFloat(value2);

  return !isNaN(numValue1) && !isNaN(numValue2) && numValue1 === numValue2;
}

export const checkPermission = async (permissionObj, tabName, permissionType) => {
  const isPermission = await permissionObj[tabName]?.[permissionType] || false
  return isPermission;
}

export const fixDecimal = (value, decimalNumber) => {
  if (typeof value === "number" && value !== Infinity) return value.toFixed(decimalNumber)
  if (value === Infinity || isNaN(value)) return 0
  else return value
}

export const getDateRange = (daysAgo = 7) => {
  const today = new Date();
  
  // Calculate the start date by subtracting the specified number of days
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysAgo);
  startDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00
  
  // Set end date to today at 23:59:00
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - (daysAgo + 1));
  endDate.setHours(23, 59, 0, 0);  // Set time to 23:59:00

  return {
    startDate: `${startDate.toISOString().split("T")[0]}T00:00:00`,
    endDate: `${endDate.toISOString().split("T")[0]}T23:59:00`,
  };
};