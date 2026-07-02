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
import { isEmpty, isEqual, pickBy } from "lodash";
import { TAB_SUBSCRIBERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR, MODULE_SUBSCRIBERS, } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal2_24, convertDateUtcFormat24, convertDateLocalToUTC } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {ImportExportModel} from '../../components/Model/ImportExportModel'
import SubDomainsModels from '../../components/Model/SubdomainsModel'
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_SUBSCRIBERS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = TAB_SUBSCRIBERS;
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [domainsModelVisable, setDomainsModelVisable] = useState(false);
  const [subDomains, setSubDomains] = useState([]);
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
  const [isSearch, setIsSearch] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }T23:59:00`,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
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
    payload = pickBy(payload, (value) => value !== null && value !== undefined);
  
    await axiosInstance
      .post(`/admin/subscribeDomain/all`, payload)
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.subScribesDomainId - b?.subScribesDomainId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.subScribesDomainId)
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

  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.subScribesDomainId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.subScribesDomainId);
    } else {
      updateSingleCheck = [...checekedList, e.subScribesDomainId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/subscribeDomain/isDomainApprove`, {
        subScribesDomainId: record.subScribesDomainId,
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

  const handleVideoPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/subscribeDomain/activeInactiveVideoApproved`, {
        subScribesDomainId: record.subScribesDomainId,
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

  const handleActivePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/subscribeDomain/activeInactiveSubscribeDomain`, {
        subScribesDomainId: record.subScribesDomainId,
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
      .post(`/loadPanelData`, {module: [MODULE_SUBSCRIBERS], password})
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
      .post(`/admin/subscribeDomain/delete`, {
        subScribesDomainId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setCheckedList([]);
      });
  };

  const handleDomains = async (data) => {
    setSubDomains(data)
    setDomainsModelVisable(true)
  };
  const handleReset = (value) => {
    setIsSearch(false);
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }T23:59:00`,
    });
    fetchData(value)
  };

  const handleUpdateAllActive = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`admin/subscribeDomain/inactiveAllSubscribeDomain`)
      .then((response) => {
        fetchData()
        dispatch(
          updateToastData({
            data: response.result,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
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

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.subScribesDomainId)
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
            // checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            // onChange={() => {
            //   setCheckedList(
            //     isEqual(checekedList?.sort(), 
            //     dataIndexList?.sort())
            //      ? []
            //      : dataIndexList
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
            checked={checekedList.includes(record.subScribesDomainId)}
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
    {
      title: "Site Name",
      dataIndex: "siteName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "siteName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Site Domain",
      dataIndex: "siteDomain",
      key: "siteDomain",
      style: { width: "10%" },
      sort: true,
    },
    {
        title: "subDomain Count",
        dataIndex: "subDomainCount",
        key: "subDomainCount",
        style: { width: "5%", textAlign:"center" },
        sort: true,
      },
      {
        title: "subDomains",
        dataIndex: "subDomains",
        key: "subDomains",
        render: (text, record) => (
          <span style={{ cursor: "pointer", }} onClick={()=>{handleDomains(text)}}>
            <i className="fas fa-eye"></i>
          </span>
        ),
        style: { width: "5%", textAlign:"center" },
        sort: true,
      },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")}
        </span>
      ),
      key: "createdDate",
      sort: true,
      style: { width: "5%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleActivePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Scorecard",
      key: "isApproved",
      render: (text, record) => (
        <Button
          color={`${record.isApproved ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isApproved", record, record.isApproved);
          }}
        >
          <i className={`bx ${record.isApproved ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Stream",
      key: "isVideoApproved",
      render: (text, record) => (
        <Button
          color={`${record.isVideoApproved ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          style={{ marginRight: "350px" }}
          onClick={() => {
            handleVideoPermissions("isVideoApproved", record, record.isVideoApproved);
          }}
        >
          <i className={`bx ${record.isVideoApproved ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const handleReload = (value) => {
    fetchData();
  };
  
  //elements required
  const tableElement = {
    title: "Subscribers",
    // isActive: true,
    // isApproved: true,
    loadData: true,
    reloadButton: true,
    resetButton: true,
    scorecardSelect: true,
    streamSelect: true,
    activeSelect: true,
    isDateTypeSelect: true,
    isDateRange: true,
    scorecardOptions: [
      { label: "Select Scorecard", value: null },
      { label: "Approved", value: true },
      { label: "Decline", value: false },
    ],
    streamOptions: [
      { label: "Select Stream", value: null },
      { label: "Approved", value: true },
      { label: "Decline", value: false },
    ],
    activeOptions: [
      { label: "Select Active", value: null },
      { label: "Active", value: true },
      { label: "InActive", value: false },
    ],
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, [isSearch, permissionObj]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Subscribers" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            // onAddNavigate={"/addSubscriber"}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            reFetchData={fetchData}
            // isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
            defaultTableActionData={{
              isActive: true, 
              isApproved: null,
              isVideoApproved: null,
            }}
            dateType={dateType}
            setDateType={setDateType}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            setDateRange={setDateRange}
            dateRange={dateRange}
            renderCustomFilter={() => {
              return <>
                <Tooltip title={"InActive All Domains"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                  <Button
                    onClick={() => handleUpdateAllActive()}
                    // className="btn border"
                    color={"warning"}
                  >
                    Cross-Verify
                  </Button>
                </Tooltip>
              </>
            }}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
            <SubDomainsModels
            domainsModelVisable={domainsModelVisable}
            setDomainsModelVisable={setDomainsModelVisable}
            subDomains = {subDomains}
            handleDomains={handleDomains}
            />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Subscribers"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
