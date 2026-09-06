export const validateTabResponse = (tabs, parentId = "0") => {
  const result = [];
  for (const tab of tabs) {
    // console.log(tabs)
    const tabId = tab.encryptedTabId;
    const tabData = {
      tabId: tabId,
      // wrParentId stores the plain wrTabId of the parent tab (see
      // AddTabs.jsx's parent dropdown / createTabsQuery), not the encrypted
      // id -- keep it around so parent/child drilldown can match on it.
      rawTabId: tab.tabId,
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
      childCount: tab.childCount
    };
    result.push(tabData);
  }
  return result;
};