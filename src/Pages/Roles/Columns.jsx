import React, { useState, useEffect } from "react";
import { Checkbox } from "antd";
export const Columns = ({
  permissions,
  updatePagePermission,
  updateAllPermission,
}) => {
  // Initialize the checkbox state using a map
  const [checkboxStates, setCheckboxStates] = useState([]);
  const [allCheckBoxes, setAllCheckBoxes] = useState({
    isViewPermission: false,
    isAddPermission: false,
    isEditPermission: false,
    isDeletePermission: false,
  });

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
    console.log("1", initialCheckboxStates);
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

  const handleAllPermissions = (name) => {
    setAllCheckBoxes((preValue) => {
      return {
        ...preValue,
        [name]: !allCheckBoxes[name],
      };
    });
    updateAllPermission(name, !allCheckBoxes[name]);
  };

  useEffect(() => {
    let isViewPermission = true;
    let isAddPermission= true;
    let isDeletePermission = true;
    let isEditPermission = true

    Array.from(checkboxStates)?.map((val, i)=>{
      isAddPermission = isAddPermission && val[1].isAddPermission
      isDeletePermission = isDeletePermission && val[1].isDeletePermission
      isViewPermission = isViewPermission && val[1].isViewPermission
      isEditPermission = isEditPermission && val[1].isEditPermission
    })

    setAllCheckBoxes({
      isAddPermission,
      isDeletePermission,
      isViewPermission,
      isEditPermission,
    })
  }, [checkboxStates]);

  const columns = [
    {
      Header: "Tab Name",
      accessor: "displayName",
    },
    {
      Header: (row) => (
        <div>
          <span>View</span>{" "}
          <Checkbox
            type="checkbox"
            style={{ transform: "scale(1.2)" }}
            onChange={() => {
              handleAllPermissions("isViewPermission");
            }}
            checked={allCheckBoxes.isViewPermission}
          />
        </div>
      ),
      accessor: "isView",
      Cell: ({ row }) => (
        <Checkbox
          type="checkbox"
          style={{ transform: "scale(1.3)" }}
          checked={
            checkboxStates.get(row.original.tabId)?.isViewPermission || false
          }
          onChange={() =>
            togglePermission(row.original.tabId, "isViewPermission")
          }
        />
      ),
    },
    {
      Header: (row) => (
        <div>
          <span>Add</span>{" "}
          <Checkbox
            type="checkbox"
            style={{ transform: "scale(1.2)" }}
            onChange={() => {
              handleAllPermissions("isAddPermission");
            }}
            checked={allCheckBoxes.isAddPermission}
          />
        </div>
      ),
      accessor: "isAdd",
      Cell: ({ row }) =>
        row.original.isAdd ? (
          <Checkbox
            type="checkbox"
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
      Header: (row) => (
        <div>
          <span>Edit</span>{" "}
          <Checkbox
            type="checkbox"
            style={{ transform: "scale(1.2)" }}
            onChange={() => {
              handleAllPermissions("isEditPermission");
            }}
            checked={allCheckBoxes.isEditPermission}
          />
        </div>
      ),
      accessor: "isEdit",
      Cell: ({ row }) =>
        row.original.isEdit ? (
          <Checkbox
            type="checkbox"
            checked={
              checkboxStates.get(row.original.tabId)?.isEditPermission || false
            }
            style={{ transform: "scale(1.3)" }}
            onChange={() =>
              togglePermission(row.original.tabId, "isEditPermission")
            }
          />
        ) : (
          "N/A"
        ),
    },
    {
      Header: (row) => (
        <div>
          <span>Delete</span>{" "}
          <Checkbox
            type="checkbox"
            style={{ transform: "scale(1.2)" }}
            onChange={() => {
              handleAllPermissions("isDeletePermission");
            }}
            checked={allCheckBoxes.isDeletePermission}
          />
        </div>
      ),
      accessor: "isDelete",
      Cell: ({ row }) =>
        row.original.isDelete ? (
          <Checkbox
            type="checkbox"
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

export const colRender = () => {
  return {};
};
