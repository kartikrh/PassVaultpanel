import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_COMMENTARY_LOGS,
} from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import ResponseModal from "./ResponseModal";
import RequestModal from "./RequestModal";

const Index = () => {
  const pageName = TAB_COMMENTARY_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary Logs";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [resModelVisible, setResModelVisible] = useState(false);
  const [resBodyData, setResBodyData] = useState(null);
  const [reqModelVisible, setReqModelVisible] = useState(false);
  const [reqBodyData, setReqBodyData] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const commentaryId = queryParams.get('commentaryId') || 0;

  const navigate = useNavigate();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      page: currentPage+1,
      limit: pageSize,
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
        ...dateRange,
      };
    }
    await axiosInstance
      .post(`/admin/log/commentaryLogs`, payload)
      .then((response) => {
        const logsData = response?.result?.data;
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setData(logsData);
        setTotal(response?.result?.totalPages || 0); 
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
  
  useEffect(()=>{
    if(commentaryId !== 0){
      setIsSearch(false)
    } else {
      setIsSearch(true)
    }
  },[commentaryId])

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
  //table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "createdDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Commentary Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "10%", textAlign: "center" },
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
    {
      title: "Response",
      dataIndex: "response",
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
        }}>{logItems}</div>;
      },
      key: "response",
      sort: true,
      style: { width: "20%" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Commentary Logs",
    eventTypeSelect: true,
    competitionsSelect: true,
    commentarySelect: true,
    resetButton: true,
    reloadButton: true,
    isServerPagination: true,
    isDateRange: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchEventTypeData();
  }, [isSearch, currentPage, pageSize]);

  const handleReset = (value) => {
    fetchData();
    fetchEventTypeData();
  };

  const handleReload = (value) => {
    fetchData();
    fetchEventTypeData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary Logs" />
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
