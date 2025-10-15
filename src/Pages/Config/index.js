import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual } from "lodash";
import { ERROR, MODULE_CONFIG, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_CONFIG } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import DeleteAllModel from "../../components/Model/DeleteAllModel";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";
// import PanelLoadDataModel from "../../components/Model/PanelLoadDataModel";
// import ClientLoadDataModel from "../../components/Model/ClientLoadDataModel";

const Index = () => {
  const pageName = TAB_CONFIG
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Players";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAllModelVisable, setDeleteAllModelVisable] = useState(false);
  // const [loadPanelModelVisable, setLoadPanelModelVisable] = useState(false);
  // const [loadClientModelVisable, setLoadClientModelVisable] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [isSignalRStarted, setIsSignalRStarted] = useState(true);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  // const [run, setRun] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/config/all`, {
        ...(latestValueFromTable || { ...tableActions })
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.configId - b?.configId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.configId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.configId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.configId);
    } else {
      updateSingleCheck = [...checekedList, e.configId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/config/save`, {
        // blockId: record.blockId,
        ...record,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_CONFIG], password})
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

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/config/delete`, {
        configId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  //load client data
  const handleLoadClientData = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadClientData`)
      .then((response) => {
        fetchData();
        // setLoadClientModelVisable(false);
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
  //load panel data
  const handleLoadPanelData = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadData`)
      .then((response) => {
        fetchData();
        // setLoadPanelModelVisable(false);
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
  const handleSignalRCheckStatus = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/signalr/checkStatus`)
      .then((response) => {
        const status = response?.data?.isSignalRStarted
        setIsSignalRStarted(status)
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };
  const handleSignalRToggle = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/signalr/toggle`)
      .then((response) => {
        fetchData();
        handleSignalRCheckStatus()
        dispatch(
          updateToastData({
            data: response?.status,
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
  //delete All Commentary
  const handleDeleteAll = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/deleteAllCommentary`)
      .then((response) => {
        fetchData();
        setDeleteAllModelVisable(false);
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
  //chnage Penalty Run
  const handleRuns = async (value) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/config/save`, value)
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (configId) => {
    // navigate("/addblocks", { state: { userId: blockId } });
    navigate("/addConfig", { state: { configId } });
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.configId)
      : dataIndexList;

    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(
      isEqual(checekedList?.sort(), currentItems?.sort())
        ? []
        : currentItems
    );
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 &&
      isEqual(checekedList?.sort(), currentItems?.sort());
  };

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
    setCheckedList([]);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCheckedList([]);
  };

  //table columns
  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checkIfAllSelected()}
            onChange={handleSelectAllClick}
            // checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            // onChange={() => {
            //   setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
            //   )
            // }}
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
            checked={checekedList.includes(record.configId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
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
            handleEdit(record.configId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Key",
      dataIndex: "key",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "key",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Value",
      dataIndex: "value",
      //   render: (text, record) => (
      //     <span style={{ cursor: "pointer" }}>
      //       {record.parentId === "0" ? "Root" : (record?.parentName || null)}
      //     </span>
      //   ),
      key: "value",
      sort: true,
      style: { width: "100%" },
    },

    {
      title: "Description",
      dataIndex: "desc",
      //   render: (text, record) => (
      //     <span style={{ cursor: "pointer" }}>
      //       {record.parentId === "0" ? "Root" : (record?.parentName || null)}
      //     </span>
      //   ),
      key: "desc",
      sort: true,
      style: { width: "100%" },
    },

    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
      <Tooltip title={"Config"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          {" "}
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },

    {
      title: "For Admin",
      key: "isForAdmin",
      dataIndex: "isForAdmin",
      render: (text, record) => (
      <Tooltip title={"For Admin"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isForAdmin", record, record.isForAdmin);
          }}
        >
          {" "}
          <i className={`bx ${record.isForAdmin ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Config",
    // headerSelect: false,
    isActive: true,
    reloadButton: true,
    loadData: true,
    // clone: false,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard")
    }
    fetchData();
    handleSignalRCheckStatus()
  }, [permissionObj]);

  const handleReload = (value) => {
    fetchData();
    // handleSignalRCheckStatus()
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Config" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteAllModelFunction={setDeleteAllModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            loadPanelModelFunction={handleLoadPanelData} 
            loadClientModelFunction={handleLoadClientData}
            loadSignalRToggleFunction={handleSignalRToggle}
            isSignalRStarted={isSignalRStarted}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addConfig"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            isDeleteAllPermission={checkPermission(permissionObj,pageName,PERMISSION_EDIT)}
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          {/* <PanelLoadDataModel
            loadPanelModelVisable={loadPanelModelVisable}
            setLoadPanelModelVisable={setLoadPanelModelVisable}
            handleLoadPanelData={handleLoadPanelData}
            singleCheck={checekedList}
          /> */}
          {/* <ClientLoadDataModel
            loadClientModelVisable={loadClientModelVisable}
            setLoadClientModelVisable={setLoadClientModelVisable}
            handleLoadClientData={handleLoadClientData}
            singleCheck={checekedList}
          /> */}
          <DeleteAllModel
            deleteAllModelVisable={deleteAllModelVisable}
            setDeleteAllModelVisable={setDeleteAllModelVisable}
            handleDeleteAll={handleDeleteAll}
            singleCheck={checekedList}
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
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Config"}
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
