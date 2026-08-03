import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  LIVE_ACTIVITY_TOKEN,
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormat24, convertDateUTCToLocal2, convertDateUTCToLocal2_24 } from "../../components/Common/Reusables/reusableMethods";
import { isEmpty, isEqual } from "lodash";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import { Button } from "reactstrap";
import { AutoImportErrorModel } from "../../components/Model/AutoImportErrorModel";

const Index = () => {
  const globalPageSize = localStorage.getItem("pageSize")
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const pageName = LIVE_ACTIVITY_TOKEN;
  const dispatch = useDispatch();
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = LIVE_ACTIVITY_TOKEN;
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [eventTypes, setEventTypes] = useState([]);
  // const [competitions, setCompetitions] = useState([]);
  // const [commentary, setCommentary] = useState([]);
  // const [eventTypeId, setEventTypeId] = useState(null);
  // const [competitionId, setCompetitionId] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [total, setTotal] = useState(0);
  // const [selectedTableElements, setSelectedTableElements] = useState({
  //   eventType: null,
  //   competition: null,
  //   commentary: null,
  // });
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [selectedTableElements, setSelectedTableElements] = useState({
    envType: null,
    clientSocketId: null
  });
  const [clientSocketList, setClientSocketList] = useState([]);

  const navigate = useNavigate();

  // const fetchCompetitionData = async (value) => {
  //   await axiosInstance
  //     .post(`/admin/log/competitionListByEventTypeId`, {
  //       eventTypeId: value,
  //     })
  //     .then((response) => {
  //       setCompetitions(response.result);
  //     })
  //     .catch((error) => { });
  // };

  // const fetchCommentaryData = async (value) => {
  //   await axiosInstance
  //     .post(`/admin/log/getComByCompetition`, {
  //       competitionId: value,
  //     })
  //     .then((response) => {
  //       setCommentary(response.result);
  //     })
  //     .catch((error) => { });
  // };

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
      // eventTypeId: data?.eventTypeId || 0,
      // competitionId: data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
      // commentaryId: (data?.eventTypeId !== eventTypeId || data?.competitionId !== competitionId) ? 0 : data?.commentaryId || 0,
    }

    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/liveActivityToken/all`, payload)
      .then((response) => {
        const tokenData = response?.result?.data?.sort((a, b) => b?.id - a?.id);
        // let logsDataIdList = [];
        // logsData.forEach((ele) => {
        //   logsDataIdList.push(ele?.id);
        // });
        // setDataIndexList(logsDataIdList);
        setData(tokenData);
        setTotal(response?.result?.total || 0);
        // setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    // if (data?.eventTypeId && latestValueFromTable) {
    //   fetchCompetitionData(data?.eventTypeId);
    // }
    // if (data?.competitionId && latestValueFromTable) {
    //   fetchCommentaryData(data?.competitionId);
    // }
  };

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  const mapEnvType = (envType) => {
    switch (parseInt(envType)) {
      case 1:
        return "Production";
      case 2:
        return "Sandbox";
      default:
        return "-";
    }
  }

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
          // checked={checkIfAllSelected()}
          // onChange={handleSelectAllClick}
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
        <div className={`form-check d-flex align-items-center justify-between ${checekedList.includes(record.id) ? "selected-row" : ""
          }`}>
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.id)}
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
      title: "Id",
      dataIndex: "id",
      key: "id",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "ENV Type",
      dataIndex: "envType",
      key: "envType",
      sort: true,
      style: { width: "10%" },
      render: (text, record) => <span>{mapEnvType(text)}</span>,
    },
    {
      title: "Client Socket",
      dataIndex: "serverName",
      key: "serverName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Bundle",
      dataIndex: "bundleId",
      key: "bundleId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Token",
      dataIndex: "apnsToken",
      key: "apnsToken",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "createdAt",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Expire Date",
      dataIndex: "expiresAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "expiresAt",
      sort: true,
      style: { width: "10%" },
    }
  ];

  //elements required
  const tableElement = {
    title: LIVE_ACTIVITY_TOKEN,
    // eventTypeSelect: true,
    // competitionsSelect: true,
    // commentarySelect: true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
    apnsEnvTypeSelect: true,
    clientSocketSelect: true
  };

  const fetchClientSocketData = async () => {
    await axiosInstance
      .post(`/admin/clientSocket/all`, {
        isActive: true,
      })
      .then((response) => {
        setClientSocketList(response.result?.map((item) => ({
          value: item?.clientSocketId,
          label: item?.serverName
        })));
      })
      .catch((error) => { });
  }

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchClientSocketData();
    // fetchEventTypeData();
  }, [isSearch, currentPage, pageSize, permissionObj]);

  // useEffect(() => {
  //   if (!eventTypeId) {
  //     setCompetitions([]);
  //     setCommentary([]);
  //   }
  // }, [eventTypeId]);

  // const fetchEventTypeData = async () => {
  //   await axiosInstance
  //     .post(`/admin/log/eventTypeList`, { isActive: true })
  //     .then((response) => {
  //       setEventTypes(response.result);
  //     })
  //     .catch((error) => { });
  // };

  const handleReset = (value) => {
    setDateRange({
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
    })
    setIsSearch(true)
  };

  useEffect(() => {
    if (isSearch) {
      fetchData();
    }
  }, [isSearch, dateRange]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
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

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem={LIVE_ACTIVITY_TOKEN} />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            clientSocketList={clientSocketList}
            reFetchData={fetchData}
            selectedTableElementsLogs={selectedTableElements}
            // eventTypes={eventTypes}
            // competitions={competitions}
            // commentary={commentary}
            handleReset={handleReset}
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
            // setEventTypeId={setEventTypeId}
            // setCompetitionId={setCompetitionId}
            dateType={dateType}
            setDateType={setDateType}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
