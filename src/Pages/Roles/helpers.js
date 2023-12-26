export function rearrangeTabs(inputArray) {
    // Create a dictionary to store tabs by their tabId
    const tabsById = {};

    // Build the hierarchical structure
    inputArray.forEach((tab) => {
        tabsById[tab.tabId] = { ...tab, children: [] };
    });

    const hierarchy = [];

    inputArray.forEach((tab) => {
        if (tab.parentId === "0") {
            hierarchy.push(tabsById[tab.tabId]);
        } else {
            tabsById[tab.parentId].children.push(tabsById[tab.tabId]);
        }
    });

    // Flatten the hierarchy back into an array
    function flatten(node) {
        const result = [node];
        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
                result.push(...flatten(child));
            });
        }
        return result;
    }

    const flattenedArray = [];
    hierarchy.forEach((node) => {
        flattenedArray.push(...flatten(node));
    });

    return flattenedArray;
}

export function transformData(input) {
    const result = {};

    input.forEach((item) => {
        const tabId = item.tabId;

        if (!result[tabId]) {
            result[tabId] = {
                tabId: tabId,
                isAdd: false,
                isEdit: false,
                isDelete: false,
                isView: false,
            };
        }
        //* Either get updated value or set to false if permission not yet set
        result[tabId].isAdd = item?.isAddPermission || result[tabId].isAdd;
        result[tabId].isEdit = item?.isEditPermission || result[tabId].isEdit;
        result[tabId].isDelete = item?.isDeletePermission || result[tabId].isDelete;
        result[tabId].isView = item?.isViewPermission || result[tabId].isView;
    });

    return Object.values(result);
}