import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { PERMISSION_VIEW, TAB_SCORING_LOGS } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUTCToLocal2 } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { mapCommentaryStatus } from "../Commentary/functions";
import { isEmpty } from "lodash";

function ScoringLogs() {
  const pageName = TAB_SCORING_LOGS;
  const finalizeRef = useRef(null);
  document.title = "Score Access Logs";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
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
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    commentary: null,
  });
  let navigate = useNavigate();
  const commentaryId = +sessionStorage.getItem('scoringLogsId') || 0;
  const commentaryDetails = JSON.parse(sessionStorage.getItem('scoringLogsDetails') || "{}");

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      page: currentPage+1,
      limit: pageSize,
      eventTypeId: latestValueFromTable?.eventTypeId || 0,
      competitionId: latestValueFromTable?.eventTypeId !== eventTypeId ? 0 : latestValueFromTable?.competitionId || 0,
      commentaryId: (latestValueFromTable?.eventTypeId !== eventTypeId || latestValueFromTable?.competitionId !== competitionId) ? 0 : latestValueFromTable?.commentaryId || 0,
    }
    if(commentaryId !== 0) {
      payload = {
        ...(latestValueFromTable || tableActions),
        page: currentPage+1,
        limit: pageSize,
        commentaryId: commentaryId
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post("/admin/commentaryScoringLogs/all", payload)
      .then(async (response) => {
        const apiData = response?.result?.data?.sort((a,b)=>b?.id - a?.id);
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.id);
        });
        setData(apiData);
        setTotal(response?.result?.totalRecords || 0);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
      if (latestValueFromTable?.eventTypeId) {
        fetchCompetitionData(latestValueFromTable?.eventTypeId);
      }
      if(latestValueFromTable?.competitionId) {
        fetchCommentaryData(latestValueFromTable?.competitionId);
      }
  };

useEffect(() => {
    if (commentaryId !== 0) {
      setEventTypeId(commentaryDetails.eventTypeId)
    }
}, [])

useEffect(() => {
  if(!eventTypeId) {
      setCompetitions([]);
      setCommentary([]);
    }
}, [eventTypeId]);

  useEffect(()=>{
    if(commentaryId !== 0 && commentaryDetails?.eventTypeId && commentaryDetails?.competitionId){
      setIsSearch(false)
      fetchCompetitionData(commentaryDetails?.eventTypeId);
      fetchCommentaryData(commentaryDetails?.competitionId);
    } else {
      setIsSearch(true)
    }
  },[commentaryId, commentaryDetails?.eventTypeId, commentaryDetails?.competitionId])

  useEffect(() => {
    if (commentaryDetails?.eventTypeId && commentaryDetails?.competitionId && commentaryDetails?.commentaryId) {
      const event = eventTypes.find(e => e.eventTypeId === commentaryDetails.eventTypeId)
      const competition = competitions.find(c => c.competitionId === commentaryDetails.competitionId)
      const commentaryData = commentary.find(c => c.commentaryId === commentaryDetails.commentaryId)
      setSelectedTableElements({
        eventType: {value: event?.eventTypeId, label: event?.eventType},
        competition: {value: competition?.competitionId, label: competition?.competition},
        commentary: {value: commentaryData?.commentaryId, label: commentaryData && commentaryData?.eventName && commentaryData?.eventDate ? `${commentaryData.eventName} (${convertDateUTCToLocal2(commentaryData.eventDate, "index")})` : ""},
      });
    }
  }, [commentaryDetails.eventTypeId, commentaryDetails.competitionId, commentaryDetails.commentaryId, eventTypes, competitions, commentary]);

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

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")
          }
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "eventName",
      key: "eventName",
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
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => (
        <span>{mapCommentaryStatus(text)}</span>
      ),
      key: "commentaryStatus",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Time",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal2(text, "index")}
        </span>
      ),
      key: "createdDate",
      sort: true,
      style: { width: "10%" },
    },
  ];

  const handleBackClick = () => {
    navigate("/commentary");
  };

  //elements required
  const tableElement = {
    title: "Score Access Logs",
    eventTypeSelect: true,
    competitionsSelect: true,
    commentarySelect: true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  },[isSearch, currentPage, pageSize, permissionObj]);

  useEffect(() => {
    fetchEventTypeData();
  }, []);

  const handleReset = (value) => {
    fetchData({ isActive: true });
    fetchEventTypeData();
  };

  const handleReload = (value) => {
    fetchData({ isActive: true });
    fetchEventTypeData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          {isLoading && <SpinnerModel />}

          <Row>
            <Col className="mt-3 mt-lg-4 mt-md-4">
              <Breadcrumbs
                title="Commentary"
                breadcrumbItem="Score Access Logs"
              />
            </Col>
            <Col className="mt-3 mt-lg-3 mt-md-3">
              <button
                className="btn btn-danger text-right"
                onClick={handleBackClick}
              >
                Back
              </button>
            </Col>
          </Row>
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            reFetchData={fetchData}
            eventTypes={eventTypes}
            competitions={competitions}
            commentary={commentary}
            selectedTableElementsLogs={selectedTableElements}
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
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default ScoringLogs;