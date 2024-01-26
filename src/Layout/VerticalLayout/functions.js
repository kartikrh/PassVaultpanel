export const validateTabResponse = (tabs, parentId = "0") => {
  const result = [];
  for (const tab of tabs) {
    const tabId = tab.encryptedTabId;
    const tabData = {
      tabId: tabId,
      tabName: tab.tabName,
      displayType: tab.displayType,
      displayName: tab.displayName,
      webPage: tab.webPage,
      parentId: tab.parentId,
      IsActive: tab.isActive,
      IsAdd: tab.isAdd,
      IsEdit: tab.isEdit,
      IsDelete: tab.isDelete,
      IsView: tab.isView,
      AddWebpage: tab.addWebpage,
      IsMenu: tab.isMenu,
      IconName: tab.iconName,
      DisplayOrder: tab.displayOrder,
    };
    result.push(tabData);
  }
  return result;
};