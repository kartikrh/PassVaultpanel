import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { validateTabResponse } from "../../Layout/VerticalLayout/functions";
import { apiGetTabCleaner } from "../../helpers/helper";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import _, { isEqual } from "lodash";
import {
  ERROR,
  MODULE_MENU_LIST,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  Tab_Menu_List,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {
  resetMenuTypeSliceData,
  setSelectedMenuTypeHistory,
  setSelectedMenuType,
} from "../../Features/Tabs/menuTypeSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = Tab_Menu_List;
  const finalizeRef = useRef(null);
  document.title = "Menu List";
  const { selectedMenuType, selectedMenuTypeHistory } = useSelector(
    (state) => state.tabsData?.menuType
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);

  // const [addModelVisable, setAddModelVisable] = useState(false);
  // const [level, setLevel] = useState(0);
  // const [displayTypes, setDisplayTypes] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const displayTypes = [1, 2];

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(
        `${selectedMenuType?.level == 0
          ? "/admin/menuTypes/all"
          : "/admin/menuItem/menuItemList"
        }`,
        +selectedMenuType?.level === 0
          ? {
            parentId: selectedMenuType.id,
            ...(latestValueFromTable || tableActions),
          }
          : +selectedMenuType?.level === 1
            ? {
              ...(latestValueFromTable || tableActions),
              parentId: selectedMenuType.parentId,
              menuTypeId: selectedMenuType?.menuTypeId,
            }
            : {
              ...(latestValueFromTable || tableActions),
              parentId: selectedMenuType.menuItemId,
              menuTypeId: selectedMenuType.menuTypeId,
            }
      )
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          const uniqueId = +selectedMenuType?.level === 0 ? ele?.menuTypeId : ele?.displayOrder
          apiDataIdList.push(uniqueId)
        })
        setDataIndexList(apiDataIdList)
        setData(apiData);
        setCheckedList([]);
        setIsLoading(false);
        setDeleteModelVisable(false);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e)) {
      updateSingleCheck = checekedList.filter((item) => item !== e);
    } else {
      updateSingleCheck = [...checekedList, e];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `${selectedMenuType.level == 0
          ? "/admin/menuTypes/save"
          : "/admin/menuItem/activeInactiveMenuItem"
        }`,
        selectedMenuType.level == 0
          ? {
            menuTypeId: record.menuTypeId,
            [pType]: cState ? false : true,
          }
          : {
            menuItemId: record.menuItemId,
            [pType]: cState ? false : true,
          }
      )
      .then((response) => {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_MENU_LIST], password})
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleDelete = async (e) => {
    if (checekedList?.length > 0) {
      setIsLoading(true);
      await axiosInstance
        .post(
          `/admin/${selectedMenuType.level == 0 ? "menuTypes" : "menuItem"
          }/delete`,
          {
            [selectedMenuType.level == 0 ? "menuTypeId" : "menuItemId"]:
              checekedList,
          }
        )
        .then((response) => {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
          fetchData();
          setIsLoading(true);
        })
        .catch((error) => {
          setIsLoading(false);
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
        });
    }
  };

  const handleEdit = (id) => {
    navigate(selectedMenuType.level == 0 ? "/addMenuType" : "/addMenuItem", {
      state: {
        [selectedMenuType.level == 0 ? "menuTypeId" : "menuItemId"]: id,
      },
    });
  };

  const handleReset = (value) => {
    fetchData(value);
  };

  const handleBreadCrumbsClick = (value) => {
    let historyList = _.clone(selectedMenuTypeHistory);
    const index = historyList.findIndex((item) => item.value === value);
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    dispatch(setSelectedMenuTypeHistory(historyList));
    dispatch(setSelectedMenuType(value));
  };

  const columnsMenuTypes = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
            }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(+selectedMenuType.level === 0 ? record.menuTypeId : record.menuItemId)}
            onChange={() => {
              handleSingleCheck(selectedMenuType.level == 0 ? record.menuTypeId : record.menuItemId);
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "menuItem",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(selectedMenuType.level == 0 ? record.menuTypeId : record.menuItemId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Menu",
      dataIndex: "menuTypeName",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            // setLevel(1);
            let currentRecord = [
              {
                label: record.menuTypeName,
                value: {
                  menuTypeId: record?.menuTypeId,
                  level: 1,
                  parentId: 0,
                  isActive: true,
                },
              },
            ];
            let historyList = selectedMenuTypeHistory
              ? [].concat(selectedMenuTypeHistory, currentRecord)
              : currentRecord;
            dispatch(setSelectedMenuTypeHistory(historyList));
            dispatch(
              setSelectedMenuType({
                menuTypeId: record?.menuTypeId,
                level: 1,
                parentId: 0,
                isActive: true,
              })
            );
          }}
        >
          {text}
        </span>
      ),
      key: "menuTypeName",
      style: { width: "10%" },
    },
    {
      title: "Level",
      dataIndex: "noOfLevel",
      key: "noOfLevel",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "No.Child",
      dataIndex: "childCount",
      key: "childCount",
      render: (text, record) => <span>{text}</span>,
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Block",
      dataIndex: "blockName",
      render: (text, record) => (text ? text : "N/A"),
      key: "blockId",
      style: { width: "10%" },
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
      <Tooltip title={"Menu List"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const columnsMenuItems = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
            }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(selectedMenuType.level == 0 ? record.menuTypeId : record.menuItemId)}
            onChange={() => {
              handleSingleCheck(selectedMenuType.level == 0 ? record.menuTypeId : record.menuItemId);
            }}
          />
          <i className="bx bx-move ms-1 mt-1"></i>
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "menuItem",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(selectedMenuType.level == 0 ? record.menuTypeId : record.menuItemId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Menu Title",
      dataIndex: "menuItem",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            let currentRecord = [
              {
                label: record.menuItem,
                value: {
                  menuItemId: record?.menuItemId,
                  displayType: record?.menuItem,
                  level: 2,
                },
              },
            ];
            let historyList = selectedMenuTypeHistory
              ? [].concat(selectedMenuTypeHistory, currentRecord)
              : currentRecord;
            dispatch(setSelectedMenuTypeHistory(historyList));
            dispatch(
              setSelectedMenuType({
                menuItemId: record?.menuItemId,
                displayType: record?.menuItem,
                level: 2,
              })
            );
          }}
        >
          {text}
        </span>
      ),
      key: "menuItem",
      style: { width: "85%" },
    },
    {
      title: "No.Child",
      dataIndex: "childCount",
      key: "childCount",
      render: (text, record) => <span>{text ? text : "N/A"}</span>,
      sort: true,
      style: { width: "50%" },
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const tableElement = {
    title: "Menu",
    dragDrop: true,
    // displayTypeDropDown: true,
    switch: false,
    subTable: true,
    resetButton: true,
    reloadButton: true,
    isActive: true,
    loadData: true,
    // displayTypes: [
    //   { label: "Admin", value: 1 },
    //   { label: "Agent", value: 2 },
    // ],
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    // return (() => {
    //   dispatch(resetTabSliceData())
    // })
    // dispatch(
    //   setSelectedMenuType({  
    //     isActive: true,
    //     parentId: 0, 
    //     level: 0,
    //     id:0,
    //     menuTypeId:0,
    //     menuItemId:0,
    // })
    // )
    // dispatch()
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedMenuType]);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Menu List" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={
              selectedMenuType.level == 0 ? columnsMenuTypes : columnsMenuItems
            }
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            onAddNavigate={
              selectedMenuType.level == 0 ? "/addMenuType" : "/addMenuItem"
            }
            changeOrderApiName="menuItem"
            displayTypes={displayTypes}
            singleCheck={checekedList}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            reFetchData={fetchData}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            breadCrumbs={selectedMenuTypeHistory}
            onBreadCrumbsClick={handleBreadCrumbsClick}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Menu List"} 
            />}
          {/* <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          /> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
