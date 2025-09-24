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
  TAB_PREDICTOR_LOGS,
} from "../../components/Common/Const";
import { isEmpty, isEqual } from "lodash";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormat24, convertDateUTCToLocal2, convertDateUTCToLocal2_24 } from "../../components/Common/Reusables/reusableMethods";
import ResponseModal from "./ResponseModal";
import RequestModal from "./RequestModal";
import { mapCommentaryStatus } from "../Commentary/functions";

const Index = () => {
  const pageName = TAB_PREDICTOR_LOGS;
  const globalPageSize = localStorage.getItem("pageSize")
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Predictor Logs";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [resModelVisible, setResModelVisible] = useState(false);
  const [resBodyData, setResBodyData] = useState(null);
  const [reqModelVisible, setReqModelVisible] = useState(false);
  const [reqBodyData, setReqBodyData] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
    const [dataIndexList, setDataIndexList] = useState([]);
  const [cloneValues, setCloneValues] = useState({
        eventName: "",
        eventRefId: "",
    });
  const [dateType, setDateType] = useState({ label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [total, setTotal] = useState(0);
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    commentary: null,
  });
  const commentaryId = +sessionStorage.getItem('predictorLogsId') || 0;
  const commentaryDetails = JSON.parse(sessionStorage.getItem('predictorLogsDetails') || "{}");

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
    }
    if(commentaryId !== 0) {
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
      .post(`/admin/log/predictorLogs`, payload)
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
    if (data?.eventTypeId && latestValueFromTable) {
      fetchCompetitionData(data?.eventTypeId);
    }
    if(data?.competitionId && latestValueFromTable) {
      fetchCommentaryData(data?.competitionId);
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
        commentary: {value: commentaryData?.commentaryId, label: commentaryData && commentaryData?.eventName && commentaryData?.eventDate ? `${commentaryData.eventName} (${convertDateUTCToLocal2_24(commentaryData.eventDate, "index")})` : ""},
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
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
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
      title: "Id",
      dataIndex: "id",
      key: "id",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "requestStartTime",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "requestStartTime",
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
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "End Point",
      dataIndex: "endPoint",
      key: "endPoint",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Response",
      dataIndex: "response",
      render: (text, record) => {
        // const logObject = text;
        // const logItems =
        //   logObject &&
        //   Object.entries(logObject).map(([key, value]) => (
        //     <span key={key}>
        //       <strong>{key}:</strong>{" "}
        //       {typeof value === "object" ? JSON.stringify(value) : value}{" "}
        //     </span>
        //   ));
        const renderContent = () => {
          if (typeof text === 'string') {
            return <span>{text}</span>;
          }
    
          if (typeof text === 'object' && text !== null) {
            const logItems = Object.entries(text).map(([key, value]) => (
              <span key={key}>
                <strong>{key}:</strong>{" "}
                {typeof value === "object" ? JSON.stringify(value) : value}{" "}
              </span>
            ));
            return <div>{logItems}</div>;
          }
    
          return null;
        };
        return <div 
        onClick={() => {
                  setResModelVisible(true);
                  setResBodyData(record?.response);
                }}
        style={{ 
          display: 'inline-block', 
          maxWidth: '400px',
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          cursor: "pointer"
        }}> {renderContent()}</div>;
      },
      key: "response",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Request Body",
      dataIndex: "requestBody",
      render: (text, record) => {
        const logObject = text;
        const logItems =
          logObject &&
          Object.entries(logObject).map(([key, value]) => (
            <span key={key}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}{" "}
            </span>
          ));
        return <div 
        onClick={() => {
                  setReqModelVisible(true);
                  setReqBodyData(record?.requestBody);
                }}
        style={{ 
          display: 'inline-block', 
          maxWidth: '400px',
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          cursor: "pointer" 
        }}>{logItems}</div>;
      },
      key: "requestBody",
      sort: true,
      style: { width: "20%" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Predictor Logs",
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
    const newDateRange = {
      startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
      endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
    };

    setDateRange(newDateRange);
    setIsSearch(true)
    fetchData({ isActive: true,
      startDate: convertDateLocalToUTC(newDateRange.startDate, "index"),
      endDate: convertDateLocalToUTC(newDateRange.endDate, "index"),
    });
    fetchEventTypeData();
  };

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Predictor Logs" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            competitions={competitions}
            commentary={commentary}
            singleCheck={checekedList}
            reFetchData={fetchData}
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
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
          {reqModelVisible && (
            <RequestModal
              isOpen={reqModelVisible}
              toggle={() => setReqModelVisible(!reqModelVisible)}
              data={reqBodyData}
              fetchData={fetchData}
            />
          )}
          {resModelVisible && (
            <ResponseModal
              isOpen={resModelVisible}
              toggle={() => setResModelVisible(!resModelVisible)}
              data={resBodyData}
              fetchData={fetchData}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
