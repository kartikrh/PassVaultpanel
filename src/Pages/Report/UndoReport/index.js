import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import Table from "../../../components/Common/Table";
import { Container } from "reactstrap";
import { Tooltip } from "antd";
import SpinnerModel from "../../../components/Model/SpinnerModel";
import axiosInstance from "../../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_UNDO_LOGS,
} from "../../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormatWithoutSec, convertDateUtcFormatWithoutSec24, convertDateUTCToLocalWithoutSec, convertDateUTCToLocalWithoutSec24 } from "../../../components/Common/Reusables/reusableMethods";
import { isEmpty } from "lodash";
const UNDO_REPORT_TYPE = [
  { label: "Commentary", value: 1 },
  { label: "User", value: 2 }
]
const Index = () => {
  const pageName = TAB_UNDO_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Undo Report";
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [reportType, setReportType] = useState(1);
  const [reportTypeColumn, setReportTypeColumn] = useState(reportType);
  const [isLoading, setIsLoading] = useState(false);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [createdByList, setCreatedByList] = useState([]);

  const navigate = useNavigate();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
      eventTypeId: data?.eventTypeId || 0,
      competitionId: data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
      commentaryId: (data?.eventTypeId !== eventTypeId || data?.competitionId !== competitionId) ? 0 : data?.commentaryId || 0,
      // createdById: data?.createdById || 0,
      type: reportType
    }
    // if (commentaryId !== 0) {
    //   payload = {
    //     ...data,
    //     page: currentPage == 0 ? 1 : currentPage,
    //     limit: pageSize,
    //     commentaryId: commentaryId
    //   };
    // }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/report/allUndoReportByType`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a, b) => b?.id - a?.id);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      }).finally(() => {
        if (reportTypeColumn !== reportType) setReportTypeColumn(reportType)
      })
  };

  const fetchCreatedByListData = async () => {
    await axiosInstance
      .post(`/admin/list/userList`, { isActive: true })
      .then((response) => {
        const formattedList = response.result?.map(ele => { return { createdBy: ele.name, createdById: ele.userId } })
        setCreatedByList(formattedList);
      })
      .catch((error) => { });
  };
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/log/eventTypeList`, { isActive: true })
      .then((response) => {
        setEventTypes(response.result);
      })
      .catch((error) => { });
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/log/competitionListByEventTypeId`, {
        eventTypeId: value,
      })
      .then((response) => {
        setCompetitions(response.result);
      })
      .catch((error) => { });
  };
  const fetchCommentaryData = async (value) => {
    await axiosInstance
      .post(`/admin/log/getComByCompetition`, {
        competitionId: value,
      })
      .then((response) => {
        setCommentary(response.result);
      })
      .catch((error) => { });
  };
  const handleUndoLogsClick = (details) => {
    const url = new URL(window.location.origin + "/undoLogs");
    sessionStorage.setItem("undoLogsId", "" + details?.commentaryId);
    sessionStorage.setItem("undoLogsDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("undoLogsId");
    sessionStorage.removeItem("undoLogsDetails");
  };

  const handleUserUndoLogsClick = (details) => {
    const url = new URL(window.location.origin + "/undoLogs");
    sessionStorage.setItem("undoUserLogId", "" + details?.createdById);
    sessionStorage.setItem("undoUserLogsDetails", "" + JSON.stringify(details)); // Fix typo
    window.open(url.href, "_blank");
    sessionStorage.removeItem("undoUserLogId");
    sessionStorage.removeItem("undoUserLogsDetails");
  };
  useEffect(() => {
    fetchEventTypeData();
    fetchCreatedByListData();
  }, [])

  const UserColumns = [
    {
      title: "User Name",
      dataIndex: "createdBy",
      render: (text, record) => (
        <Tooltip
          title={"Check Logs"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <div className="d-flex flex-column">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleUserUndoLogsClick({ createdById: record.createdById, createdBy: record.createdBy });
              }}
            >
              {text}{record?.eventNo ? `(${record.eventNo})` : ""}
            </span>
          </div>
        </Tooltip>
      ),
      key: "createdBy",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Total Undo",
      dataIndex: "totalUndo",
      key: "totalUndo",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Unique Commentary",
      dataIndex: "uniqueCommentaryCount",
      key: "uniqueCommentaryCount",
      sort: true,
      style: { width: "10%" },
    },
  ]
  const CommentaryColumns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocalWithoutSec24(text, "index")
            : convertDateUtcFormatWithoutSec24(text, "index")
          }
        </span>
      ),
      key: "date",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Commentary Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      render: (text, record) => (
        <Tooltip
          title={"Check Logs"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <div className="d-flex flex-column">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleUndoLogsClick({ eventTypeId: record.eventTypeId, competitionId: record.competitionId, commentaryId: record.commentaryId });
              }}
            >
              {text}{record?.eventNo ? `(${record.eventNo})` : ""}
            </span>
          </div>
        </Tooltip>
      ),
      key: "competition",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      render: (text, record) => (
        <Tooltip
          title={"Check Logs"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <div className="d-flex flex-column">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleUndoLogsClick({ eventTypeId: record.eventTypeId, competitionId: record.competitionId, commentaryId: record.commentaryId });
              }}
            >
              {text}{record?.eventNo ? `(${record.eventNo})` : ""}
            </span>
          </div>
        </Tooltip>
      ),
      key: "eventName",
      sort: true,
    },
    {
      title: "Total Undo",
      dataIndex: "totalUndo",
      key: "totalUndo",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Unique Scorer",
      dataIndex: "uniqueScorerCount",
      key: "uniqueScorerCount",
      sort: true,
      style: { width: "10%" },
    },
  ]

  const tableElement = {
    title: "Undo Report",
    eventTypeSelect: true,
    competitionsSelect: true,
    commentarySelect: true,
    createdByIdSelect: true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
    isReportTypeSelected: true
  };

  useEffect(() => {
    fetchData();
  }, [isSearch, currentPage, pageSize, reportType]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);


  const handleReportType = (value) => {
    setReportType(value)
  }

  useEffect(() => {
    if (!eventTypeId) {
      setCompetitions([]);
      setCommentary([]);
    } else {
      fetchCompetitionData(eventTypeId)
    }
  }, [eventTypeId]);

  useEffect(() => {
    if (!competitionId) {
      setCommentary([]);
    } else {
      fetchCommentaryData(competitionId)
    }
  }, [competitionId]);

  const handleReset = (value) => {
    const newDateRange = {
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`
    };

    setDateRange(newDateRange);
    fetchData({
      isActive: true,
      startDate: convertDateLocalToUTC(newDateRange.startDate, "index"),
      endDate: convertDateLocalToUTC(newDateRange.endDate, "index"),
    });
    setIsSearch(true)
  };

  const handleReload = (value) => {
    fetchData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Undo Report" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={reportTypeColumn === 1 ? CommentaryColumns : UserColumns}
            dataSource={data}
            tableElement={tableElement}
            eventTypes={eventTypes}
            competitions={competitions}
            commentary={commentary}
            createdByList={createdByList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            setDateRange={setDateRange}
            dateRange={dateRange}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={setCurrentPage}
            setServerPageSize={setPageSize}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            dateType={dateType}
            setDateType={setDateType}
            reportTypeOption={UNDO_REPORT_TYPE}
            reportType={reportType}
            updateReportType={handleReportType}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
