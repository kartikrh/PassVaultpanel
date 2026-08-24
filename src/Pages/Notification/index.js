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
import { isEmpty, isEqual, pickBy } from "lodash";
import {
  ERROR,
  MODULE_NOTIFICATIONS,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_NOTIFICATION,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal2_24, convertDateUtcFormat24, convertDateLocalToUTC } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_NOTIFICATION;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Notification";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const globalDateType = JSON.parse(localStorage.getItem("DateType"));
  const [dateType, setDateType] = useState(
    globalDateType || {
      label: "Local Timezone",
      value: 1,
    }
  );
  const [isSearch, setIsSearch] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${
      new Date().toISOString().split("T")[0]
    }T23:59:00`,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, permissionObj]);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
    };
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(
          latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate,
          "index"
        ),
        endDate: convertDateLocalToUTC(
          latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate,
          "index"
        ),
      };
    }
    payload = pickBy(payload, (value) => value !== null && value !== undefined && value !== "");
    await axiosInstance
      .post(`/admin/notification/all`, payload)
      .then((response) => {
        const notificationData = response?.result?.sort((a,b)=>a?.notificationId - b?.notificationId);
        let notificationDataIdList = [];
        notificationData.forEach((ele) => {
          notificationDataIdList.push(ele?.notificationId);
        });
        setData(notificationData);
        setDataIndexList(notificationDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.notificationId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.notificationId
      );
    } else {
      updateSingleCheck = [...checekedList, e.notificationId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleEdit = (notificationId) => {
    navigate("/addNotification", { state: { notificationId } });
  };

  const handleSendNotification = async (record) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/notification/sendNotification`, {
        notificationId: record.notificationId,
      })
      .then((response) => {
        fetchData();
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

  const getSendType = (status) => {
    switch (status) {
      case 1:
        return "All";
      case 2:
        return "onlyLoggedInUser";
      case 3:
        return "pushNotification";
      case 4:
        return "onlyLoggedOutUser";
      case 5:
        return "pushNotificationAndOnlyLoggedInUser";
      case 6:
        return "pushNotificationAndOnlyLoggedOutUser";
      case 7:
        return "onlyLoggedInUserAndLoggedOutUser";
      default:
        return "Unknown";
    }
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.notificationId)
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
      checekedList?.length > 0 &&
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
            // checked={
            //   data?.length > 0 &&
            //   isEqual(checekedList?.sort(), dataIndexList?.sort())
            // }
            // onChange={() => {
            //   setCheckedList(
            //     isEqual(checekedList?.sort(), dataIndexList?.sort())
            //       ? []
            //       : dataIndexList
            //   );
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
            checked={checekedList.includes(record.notificationId)}
            onChange={() => {
              handleSingleCheck(record);
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
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.notificationId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Send Type",
      dataIndex: "sendType",
      render: (text, record) => <span>{getSendType(record?.sendType)}</span>,
      key: "sendType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")}
        </span>
      ),
      key: "createDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "CID",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Message",
      dataIndex: "description",
      key: "description",
      sort: true,
      style: { width: "60%" },
    },
    {
      title: "Send",
      key: "send",
      render: (text, record) => (
      <Tooltip title={"Send Notification"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color="primary"
          size="sm"
          className="btn"
          onClick={() => {
            handleSendNotification(record);
          }}
        >
          S
        </Button>
      </Tooltip>
      ),
      style: { width: "6%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Notification",
    headerSelect: false,
    isActive: false,
    reloadButton: true,
    resetButton: true,
    loadData: true,
    clone: false,
    isDateTypeSelect: true,
    isDateRange: true,
    sendTypeSelect: true,
    sendTypeOptions: [
      { label: "Select Send Type", value: null },
      { label: "all", value: 1 },
      { label: "onlyLoggedInUser", value: 2 },
      { label: "pushNotification", value: 3 },
      { label: "onlyLoggedOutUser", value: 4 },
      { label: "pushNotificationAndOnlyLoggedInUser", value: 5 },
      { label: "pushNotificationAndOnlyLoggedOutUser", value: 6 },
      { label: "onlyLoggedInUserAndLoggedOutUser", value: 7 },
    ],
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_NOTIFICATIONS], password})
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
      .post(`/admin/notification/delete`, {
        notificationId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
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

  const handleReset = (value) => {
    setIsSearch(true);
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${
        new Date().toISOString().split("T")[0]
      }T23:59:00`,
    });
    fetchData(value);
  };

  const handleReload = (value) => {
    fetchData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Notification" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addNotification"}
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
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
            dateType={dateType}
            setDateType={setDateType}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            setDateRange={setDateRange}
            dateRange={dateRange}
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
              moduleName={"Notification"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
