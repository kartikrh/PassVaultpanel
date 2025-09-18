import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import Table from "../../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../../components/Model/SpinnerModel";
import axiosInstance from "../../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_UNDO_LOGS,
} from "../../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormatWithoutSec, convertDateUTCToLocal2, convertDateUTCToLocalWithoutSec } from "../../../components/Common/Reusables/reusableMethods";
import { isEmpty } from "lodash";
import { mapCommentaryStatus } from "../../Commentary/functions";
const UNDO_REPORT_TYPE = [
  { label: "Commentary", value: 1 },
  { label: "User", value: 2 }
]
const Index = () => {
  const pageName = TAB_UNDO_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Undo Report";
  const [data, setData] = useState([]);
  const [reportType, setReportType] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState({ label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const commentaryId = +sessionStorage.getItem('undoLogsId') || 0;
  const commentaryDetails = JSON.parse(sessionStorage.getItem('undoLogsDetails') || "{}");
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
      eventRefId: null,
      createdById: null,
      type: reportType
    }
    if (commentaryId !== 0) {
      payload = {
        ...data,
        page: currentPage == 0 ? 1 : currentPage,
        limit: pageSize,
        commentaryId: commentaryId
      };
    }
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
        const createdByListData = logsData.reduce((acc, item) => {
          const key = `${item.createdById}-${item.createdBy}`;
          if (!acc.seen.has(key)) {
            acc.seen.add(key);
            acc.result.push({ createdById: item.createdById, createdBy: item.createdBy });
          }
          return acc;
        }, { seen: new Set(), result: [] }).result;
        setCreatedByList(createdByListData);
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (commentaryId !== 0) {
      setEventTypeId(commentaryDetails.eventTypeId)
    }
  }, [])

  const UserColumns = [
    {
      title: "User Id",
      dataIndex: "createdById",
      key: "createdById",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "User Name",
      dataIndex: "createdBy",
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
            ? convertDateUTCToLocalWithoutSec(text, "index")
            : convertDateUtcFormatWithoutSec(text, "index")
          }
        </span>
      ),
      key: "date",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Ref Id",
      dataIndex: "eventRefId",
      key: "eventRefId",
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
      key: "competition",
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
      title: "Status",
      dataIndex: "status",
      render: (text, record) => (
        <span>{mapCommentaryStatus(text)}</span>
      ),
      key: "status",
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
      title: "Unique Scorer",
      dataIndex: "uniqueScorerCount",
      key: "uniqueScorerCount",
      sort: true,
      style: { width: "10%" },
    },
  ]

  const tableElement = {
    title: "Undo Report",
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
    isReportTypeSelected: true
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, currentPage, pageSize, permissionObj]);

  const handleReportType = (value) => {
    setReportType(value)
  }

  useEffect(() => {
    if (reportType) {
      fetchData()
    }
  }, [reportType])

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
            columns={reportType === 1 ? CommentaryColumns : UserColumns}
            dataSource={data}
            tableElement={tableElement}
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
