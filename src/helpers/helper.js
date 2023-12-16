export const filterOrderChange = (items) => {
console.log("this is sent ::::  ", items)
    return items.map((item, index) => {
      return {
        tabId: item.action.id,
        displayOrder: index + 1,
      };
    });
  };

  export const apiGetTabCleaner = (apiGetTab) => {
    return apiGetTab.map((e) => {
      const cleanedTab = {
        tabId: e?.tabId,
        tabName: e?.tabName,
        displayName: e?.displayName,
        displayType: e?.displayType,
        webPage: e?.webPage,
        childrenCount: e?.childrenCount,
        IsAdd: e?.IsAdd,
        IsEdit: e?.IsEdit, //
        IsDelete: e?.IsDelete, //
        IsActive: e?.IsActive, //
        IsMenu: e?.IsMenu,
        IsView: e?.IsView, //
        parentId: e?.parentId,
        action: { id: e?.tabId, parentId: e?.parentId, parentName: e?.tabName },
        displayOrder: e?.DisplayOrder,
        children: [],
      };
      if (e.children && e.children.length > 0) {
        cleanedTab.children = apiGetTabCleaner(e.children);
      }
      return cleanedTab;
    });
  };