import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_ENTITY_UPDATE_LOGS,
} from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormat24, convertDateUTCToLocal2, convertDateUTCToLocal2_24 } from "../../components/Common/Reusables/reusableMethods";
// import RequestModal from "./RequestModal";
import { isEmpty, isEqual } from "lodash";

const Index = () => {
  const pageName = TAB_ENTITY_UPDATE_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Entity Commentary Update Logs";
  const globalPageSize = localStorage.getItem("pageSize")
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [reqModelVisible, setReqModelVisible] = useState(false);
  const [reqBodyData, setReqBodyData] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [cloneValues, setCloneValues] = useState({
        eventName: "",
        eventRefId: "",
    });
    const [dataIndexList, setDataIndexList] = useState([]);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/log/entityUpdateLogs`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a,b)=>b?.id - a?.id);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setDataIndexList(logsDataIdList)
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0); 
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.id
      );
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  //checkbox select
  const getSelectedItemsData = () => {
    return tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.id)
      : dataIndexList;
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
        <div className={`form-check d-flex align-items-center justify-between ${
          checekedList.includes(record.id) ? "selected-row" : ""
        }`}>
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
              if (!checekedList.includes(record.id)) {
                setCloneValues({
                  eventName: record?.eventName,
                  eventRefId: record?.eventRefId,
                });
              }
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Commentary Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "createDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "createDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    //   sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Off set Hour",
      dataIndex: "offsetHour",
      key: "offsetHour",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <span>
          {text == 1
            ? 'Start' : text == 2 ? "No update" : text == 3 ? "Success" : text == 4 ? "failed"
            : ""
          }
        </span>
      ),
      sort: true,
      style: { width: "10%" },
    },
    
  ];
  //elements required
  const tableElement = {
    title: "Entity Commentary Update Logs",
    isServerPagination: true,
    reloadButton: true,
    isDateRange: true,
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  },[isSearch, currentPage, pageSize, permissionObj]);

  const handleReload = (value) => {
    // setIsSearch(true)
    fetchData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Entity Commentary Update Logs" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            setDateRange={setDateRange}
            dateRange={dateRange}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            // setServerCurrentPage={setCurrentPage}
            // setServerPageSize={setPageSize}
            setServerCurrentPage={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setCurrentPage(value);
            }}
            setServerPageSize={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setPageSize(value);
            }}
            setParentSearchedData={handleTableSearchedDataChange}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            dateType={dateType}
            setDateType={setDateType}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
          {/* {reqModelVisible && (
            <RequestModal
              isOpen={reqModelVisible}
              toggle={() => setReqModelVisible(!reqModelVisible)}
              data={reqBodyData}
              fetchData={fetchData}
            />
          )} */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
