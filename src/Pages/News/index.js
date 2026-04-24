import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual, isEmpty, isDate } from "lodash";
import {
  TAB_NEWS,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
  MODULE_NEWS,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal, convertDateUTCToLocalWithoutSec24, convertDateUtcFormatWithoutSec24, convertDateLocalToUTC } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_NEWS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_NEWS;
  const [data, setData] = useState([]);

  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [importExportModelVisable, setImportExportModelVisable] =
    useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [dateType, setDateType] = useState(globalDateType || {
    label: "Local Timezone",
    value: 1,
  });
  const [isSearch, setIsSearch] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59:00`,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    await axiosInstance
      .post(`/admin/news/all`, payload)
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.newsId - b?.newsId);
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.newsId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  //   const fetchEventTypeData = async () => {
  //     await axiosInstance
  //       .post(`/admin/player/eventTypeList`, {})
  //       .then((response) => {
  //         setEventTypes(response.result);
  //         setIsLoading(false);
  //       })
  //       .catch((error) => { });
  //   };
  //   const fetchTeamsData = async () => {
  //     await axiosInstance
  //       .post(`/admin/player/teamList`, {})
  //       .then((response) => {
  //         setTeams(response.result);
  //         setIsLoading(false);
  //       })
  //       .catch((error) => { });
  //   };
  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.newsId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.newsId);
    } else {
      updateSingleCheck = [...checekedList, e.newsId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/news/activeInactiveNews`, {
        newsId: record.newsId,
        [pType]: cState ? false : true,
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

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_NEWS], password})
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
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/news/delete`, {
        newsId: checekedList,
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
        setCheckedList([]);
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
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addNews", { state: { newsId: id } });
  };
  const handleReset = (value) => {
    setIsSearch(false);
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59:00`,
    });
    fetchData(value);
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.newsId)
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
            // indeterminate={
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
            checked={checekedList.includes(record.newsId)}
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
            handleEdit(record.newsId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-sm rounded-circle"
                alt=""
                src={text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "image",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
      ),
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "White Label",
      dataIndex: "domain",
      key: "domain",
      style: { width: "5%", textAlign: "left" },
    },
    // {
    //   title: "News",
    //   dataIndex: "news",
    //   render: (text, record) => (
    //     <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
    //   ),
    //   key: "news",
    //   style: { width: "80%" },
    // },
    {
      title: "Views",
      dataIndex: "viewerCount",
      key: "viewerCount",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {dateType?.value == 1
            ? convertDateUTCToLocalWithoutSec24(text, "index")
            : convertDateUtcFormatWithoutSec24(text, "index")}
        </span>
      ),
      // render: (text, record) => (
      //   <span style={{ cursor: "pointer" }}>
      //     {convertDateUTCToLocal(text, "index")}
      //   </span>
      // ),
      key: "startDate",
      style: { width: "20%" },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {dateType?.value == 1
            ? convertDateUTCToLocalWithoutSec24(text, "index")
            : convertDateUtcFormatWithoutSec24(text, "index")}
        </span>
      ),
      key: "endDate",
      style: { width: "20%" },
    },
    // {
    //   title: "Created By",
    //   dataIndex: "createdBy",
    //   key: "eventType",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "Created Date",
    //   dataIndex: "createdDate",
    //   key: "createdDate",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "Modify By",
    //   dataIndex: "modifyBy",
    //   key: "modifyBy",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "Modify Date",
    //   dataIndex: "modifyDate",
    //   key: "modifyDate",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "IsPermanent",
    //   key: "IsPermanent",
    //   render: (text, record) => (
    //     <Button
    //       color={`${record.isPermanent ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //     >
    //       <i
    //         className={`bx ${record.isPermanent ? "bx-check" : "bx-block"}`}
    //       ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Active",
      key: "IsActive",
      render: (text, record) => (
        <Tooltip title={"News"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
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
    {
      title: "Permanent",
      dataIndex: "isPermanent",
      key: "isPermanent",
      render: (text, record) => (
        <Button
          color={`${record.isPermanent ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i
            className={`bx ${record?.isPermanent ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "10%" },
    },
  ];
  //elements required
  const tableElement = {
    title: "News",
    reloadButton: true,
    resetButton: true,
    loadData: true,
    isDateTypeSelect: true,
    dateTypeButNoDateRange: true,
    activeSelect: true,
    activeOptions: [
      { label: "Select Active", value: null },
      { label: "Active", value: true },
      { label: "InActive", value: false },
    ],
    permanentSelect: true,
    permanentOptions: [
      { label: "Select Permanent", value: null },
      { label: "Permanent", value: true },
      { label: "Not Permanent", value: false },
    ],
    isDateRange: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, []);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="News" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addNews"}
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
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"News"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
