export const filterOrderChange = (items, name) => {
  return items.map((item, index) => {
    {
      if (name === "tabs") {
        return {
          tabId: item.action.id,
          displayOrder: index + 1,
        };
      } else if(name === "eventType") {
        return {
          eventTypeId: item.eventTypeId,
          displayOrder: index + 1,
        };
      } else if(name === "competition") {
        return {
          competitionId: item.competitionId,
          displayOrder: index + 1,
        };
      } else if(name === "award") {
        return {
          id: item.id,
          displayOrder: index + 1,
        };
      } else if(name === "menuItem") {
        return {
          menuItemId: item.menuItemId,
          displayOrder: index + 1,
        };
      } else if(name === "libraryImages") {
        return {
          id: item.id,
          displayOrder: index + 1,
        };
      } else if(name === "shotType") {
        return {
          id: item.id,
          displayOrder: index + 1,
        };
      }
    }
  });
};

//   export const filterOrderChange=(items)=>{
//   return items.map((item, index) => {
//      return {
//       eventTypeId: item.original.eventId,
//       displayOrder: index + 1,
//       }
//   });
//  }
export const apiGetTabCleaner = (apiGetTab) => {
  return apiGetTab.map((e) => {
    const cleanedTab = {
      tabId: e?.tabId,
      tabName: e?.tabName,
      displayName: e?.displayName,
      displayType: e?.displayType,
      webPage: e?.webPage,
      childrenCount: e?.childCount,
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
