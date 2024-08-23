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
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_TABS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { resetTabSliceData, setSelectedTabHistory, setSelectedTab } from "../../Features/Tabs/tabsSlice";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_TABS
  const finalizeRef = useRef(null);
  document.title = "Tabs";
  const { selectedTab, selectedTabHistory } = useSelector(state => state.tabsData?.tab);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  // const [displayTypes, setDisplayTypes] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const displayTypes = [1, 2]

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true)
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post("/admin/tabs/tablist", {
        parentId: selectedTab.id,
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const tabsDataDB = validateTabResponse(response?.result);
        const first = apiGetTabCleaner(tabsDataDB);
        const sorted = [...first].sort((a, b) => a.displayOrder - b.displayOrder);
        const apiDataIdList = sorted.map(item => item?.tabId).filter(Boolean);
        setData(sorted);
        setDataIndexList(apiDataIdList);
        // const displayType = [...new Set(response?.result?.map(item => item?.displayType))];
        // setDisplayTypes(displayType);
        setCheckedList([]);
        setIsLoading(false);
        setDeleteModelVisable(false)
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setIsLoading(false);
      })
  }

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.tabId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.tabId);
    } else {
      updateSingleCheck = [...checekedList, e.tabId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/tabs/save", {
        id: record.tabId,
        tabName: record.tabName,
        parentId: record.parentId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setIsLoading(false);
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleDelete = async (e) => {
    if (checekedList.length > 0) {
      setIsLoading(true);
      await axiosInstance
        .post("/admin/tabs/delete", {
          encryptedTabIds: checekedList,
        })
        .then((response) => {
          dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
          fetchData();
        })
        .catch((error) => {
          dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        });
    }
  };

  const handleEdit = (id) => {
    navigate("/addTabs", { state: { userId: id } });
  };

  const handleReset = (value) => {
    fetchData(value)
  }

  const handleBreadCrumbsClick = (value) => {
    let historyList = _.clone(selectedTabHistory)
    const index = historyList.findIndex(item => item.value === value);
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    dispatch(setSelectedTabHistory(historyList))
    dispatch(setSelectedTab({ id: value, displayType: 1 }))
  }

  const columns = [
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
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
              )
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
            checked={checekedList.includes(record.tabId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          <i className="bx bx-move ms-1 mt-1"></i>
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.tabId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Tab Name",
      dataIndex: "tabName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }} onClick={() => {
          let currentRecord = [{ label: record.tabName, value: record?.tabId }]
          let historyList = selectedTabHistory ?
            [].concat(selectedTabHistory, currentRecord) : currentRecord
          dispatch(setSelectedTabHistory(historyList))
          dispatch(setSelectedTab({ id: record?.tabId, displayType: record?.displayType }))
        }}>{text}</span>
      ),
      key: "tabName",
      style: { width: "10%" },
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Display Type",
      dataIndex: "displayType",
      key: "displayType",
      render: (text, record) => <span>{text === 1 ? "Admin" : "Agent"}</span>,
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "WebPage Route",
      dataIndex: "webPage",
      render: (text, record) => text !== null ? text : "N/A",
      key: "webPage",
      style: { width: "10%" },
    },
    {
      title: "No. of Child",
      dataIndex: "childrenCount",
      key: "childrenCount",
      style: { width: "10%" },
      render: (text, record) => text !== null ? text : "N/A",
      sort: true,
    },
    {
      title: "Is Active",
      key: "isActive",
      dataIndex: "IsActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Tab"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.IsActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.IsActive);
          }}
        >
          <i className={`bx ${record.IsActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Add",
      key: "IsAdd",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Add"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.IsAdd ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isAdd", record, record.IsAdd);
          }}
        >
          <i className={`bx ${record.IsAdd ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Edit",
      key: "IsEdit",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Edit"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.IsEdit ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isEdit", record, record.IsEdit);
          }}
        >
          {" "}
          <i className={`bx ${record.IsEdit ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Delete",
      key: "IsDelete",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Delete"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.IsDelete ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isDelete", record, record.IsDelete);
          }}
        >
          <i className={`bx ${record.IsDelete ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const tableElement = {
    title: "Tabs",
    dragDrop: true,
    displayTypeDropDown: true,
    switch: false,
    subTable: true,
    resetButton: true,
    isActive: true,
    displayTypes: [
      { label: "Admin", value: 1 },
      { label: "Agent", value: 2 },
    ]
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
    // return (() => {
    //   dispatch(resetTabSliceData())
    // })
  }, []);

  useEffect(() => {
    fetchData()
  }, [selectedTab])


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Tabs" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            onAddNavigate={"/addTabs"}
            changeOrderApiName="tabs"
            displayTypes={displayTypes}
            singleCheck={checekedList}
            handleReset={handleReset}
            reFetchData={fetchData}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            breadCrumbs={selectedTabHistory}
            onBreadCrumbsClick={handleBreadCrumbsClick}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
