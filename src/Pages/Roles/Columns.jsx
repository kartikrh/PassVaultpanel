import React, { useState, useEffect } from "react";
import { Checkbox } from "antd";
export const Columns = ({ permissions, updatePagePermission }) => {
  // Initialize the checkbox state using a map
  const [checkboxStates, setCheckboxStates] = useState(new Map());

  // Initialize checkbox states for each item in permissions
  useEffect(() => {
    const initialCheckboxStates = new Map();
    permissions.forEach((item) => {
      initialCheckboxStates.set(item.tabId, {
        isViewPermission: item.isViewPermission,
        isAddPermission: item.isAddPermission,
        isEditPermission: item.isEditPermission,
        isDeletePermission: item.isDeletePermission,
      });
    });
    setCheckboxStates(initialCheckboxStates);
  }, [permissions]);

  // Function to toggle permission for a specific tabId and permissionType
  const togglePermission = (tabId, permissionType) => {
    setCheckboxStates((prevStates) => {
      const newStates = new Map(prevStates);
      const tabPermissions = { ...newStates.get(tabId) }; // Create a copy
      tabPermissions[permissionType] = !tabPermissions[permissionType];
      newStates.set(tabId, tabPermissions);
      const updatedRow = {
        tabId,
        isView: tabPermissions.isViewPermission,
        isAdd: tabPermissions.isAddPermission,
        isEdit: tabPermissions.isEditPermission,
        isDelete: tabPermissions.isDeletePermission,
      };
      updatePagePermission(updatedRow);
      return newStates;
    });
  };

  const columns = [
    {
      Header: "Tab Name",
      accessor: "displayName",
    },
    {
      Header: "View",
      accessor: "isView",
      Cell: ({ row }) => (
        <Checkbox
          style={{ transform: "scale(1.3)" }}
          onChange={() =>
            togglePermission(row.original.tabId, "isViewPermission")
          }
          checked={
            checkboxStates.get(row.original.tabId)?.isViewPermission || false
          }
        />
      ),
    },
    {
      Header: "Add",
      accessor: "isAdd",
      Cell: ({ row }) =>
        row.original.isAdd ? (
          <Checkbox
          style={{ transform: "scale(1.3)" }}
          checked={
            checkboxStates.get(row.original.tabId)?.isAddPermission || false
          }
          onChange={() =>
            togglePermission(row.original.tabId, "isAddPermission")
          }
        />
        ) : (
          "N/A"
        ),
    },
    {
      Header: "Edit",
      accessor: "isEdit",
      Cell: ({ row }) =>
        row.original.isEdit ? (
          <Checkbox
          style={{ transform: "scale(1.3)" }}
          checked={
            checkboxStates.get(row.original.tabId)?.isEditPermission || false
          }
          onChange={() =>
            togglePermission(row.original.tabId, "isEditPermission")
          }
        />
        ) : (
          "N/A"
        ),
    },
    {
      Header: "Delete",
      accessor: "isDelete",
      Cell: ({ row }) =>
        row.original.isDelete ? (
          <Checkbox
          style={{ transform: "scale(1.3)" }}
          checked={
            checkboxStates.get(row.original.tabId)?.isDeletePermission ||
            false
          }
          onChange={() =>
            togglePermission(row.original.tabId, "isDeletePermission")
          }
        />
        ) : (
          "N/A"
        ),
    },
  ];

  return { columns };
};
