import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  TAB_SET_SESSION_RESULT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChangeSessionResult } from "../../components/Model/ChangeSessionResult";
import { Tooltip } from "antd";
import SetResultModal from "./SetResultModal";
import CancelModal from "./CancelModal";

const Index = () => {
  const pageName = TAB_SET_SESSION_RESULT;
  const commentaryId = +sessionStorage.getItem('sessionResultId') || 0;
  const commentaryDetails = JSON.parse(sessionStorage.getItem('sessionResultDetails') || "{}");

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_SET_SESSION_RESULT;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(commentaryId ? commentaryDetails?.competitionId : null);
  const [isSearch, setIsSearch] = useState(false);
  const [mtAndCategories, setMtAndCategories] = useState(null);
  const [selectedMarketType, setSelectedMarketType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [resultModelVisible, setResultModelVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState({});
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultModalData, setResultModalData] = useState(null);
  const [cancelModalData, setCancelModalData] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [ratesource, setRatesource] = useState({
    rateSourceRefId: 1,
    rateSourceType: "Ratesource"
  })
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    eventName: null,
  });

  useEffect(() => {
    if (commentaryId !== 0) {
      setEventTypeId(commentaryDetails.eventTypeId)
    }
  }, [])

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    setEventTypeActive(tableActions?.isActive)
    let payload = {
      ...(latestValueFromTable || tableActions),
      rateSourceRefId : latestValueFromTable?.rateSourceRefId || ratesource?.rateSourceRefId,
      marketTypeId: latestValueFromTable?.marketTypeId || 0,
      marketTypeCategoryId: latestValueFromTable?.marketTypeId !== selectedMarketType ? 0 : latestValueFromTable?.marketTypeCategoryId || 0,
      eventTypeId: latestValueFromTable?.eventTypeId || 0,
      competitionId: latestValueFromTable?.eventTypeId !== eventTypeId ? 0 : latestValueFromTable?.competitionId || 0,
      eventId: (latestValueFromTable?.competitionId !== competitionId || latestValueFromTable?.eventTypeId !== eventTypeId) ? 0 : latestValueFromTable?.eventId || 0,
    };
    if(commentaryId !== 0) {
      payload = {
        ...(latestValueFromTable || tableActions),
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
    if (latestValueFromTable?.eventTypeId === null) {
      payload.competitionId = null;
      payload.eventId = null;
    }
    await axiosInstance
      .post(`/admin/eventMarket/pendingMarketList`, payload)
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.eventMarketId);
        });
        setData(apiData);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchMarketCategoriesList = async () =>{
    await axiosInstance
    .post("/admin/marketTemplate/mtAndCategories", {})
    .then((response) => {
      setMtAndCategories(response?.result);
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });
  }
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/eventTypeList`, {
        isActive: EventTypeActive,
      })
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  const fetchCompetitionList = async (eventTypeId) => {
    await axiosInstance
      .post(`/admin/eventMarket/competitionListByEventTypeId`, {
        eventTypeId: eventTypeId,
      })
      .then((response) => {
        setCompetitionList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  const fetchEventList = async (competitionId) => {
    await axiosInstance
      .post(`/admin/eventMarket/commListByCompetitionId`, {
        competitionId: competitionId,
      })
      .then((response) => {
        setEventList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };

  // const handleAllowPermissions = async (pType, record, cState) => {
  //   setIsLoading(true);
  //   await axiosInstance
  //     .post(`/admin/eventMarket/setMarketIsResult`, {
  //       eventMarketId: record.eventMarketId,
  //       [pType]: cState ? false : true,
  //     })
  //     .then((response) => {
  //       fetchData();
  //       dispatch(
  //         updateToastData({
  //           data: response?.message,
  //           title: response?.title,
  //           type: SUCCESS,
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       setIsLoading(false);
  //       dispatch(
  //         updateToastData({
  //           data: error?.message,
  //           title: error?.title,
  //           type: ERROR,
  //         })
  //       );
  //     });
  // };

  const handleChangeResult = async (val) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/UpdateResulOrApproveMarketResult`, {
        ...selectedResult,
        isResult: val
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
        setResultModelVisible(false);
      })
      .catch((error) => {
        setResultModelVisible(false);
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
  const handleCancel = async (record) => {
    setCancelModalData(record);
    setIsCancelModalOpen(true);
  };
  const handleReset = (value) => {
    fetchData(value);
  };
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "NotOpen";
      case 1:
        return "Open";
      case 2:
        return "Inactive";
      case 3:
        return "Suspend";
      case 4:
        return "Close";
      case 5:
        return "Settled";
      case 6:
        return "Cancel";
      default:
        return "Unknown";
    }
  };

  const rateSourceList = [
    {
      rateSourceType: "Ratesource",
      rateSourceRefId: 1
    },
    {
      rateSourceType: "External",
      rateSourceRefId: 2
    }
  ]
  //table columns
  const columns = [
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
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
      style: { width: "10%" },
      sort: true,
    },
    // {
    //   title: "Center ID",
    //   dataIndex: "commentaryId",
    //   key: "commentaryId",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    {
      title: "ID",
      dataIndex: "eventMarketId",
      key: "eventMarketId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventTypeName",
      key: "eventTypeName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competitionName",
      key: "competitionName",
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
      title: "Market Type",
      dataIndex: "marketTypeName",
      key: "marketTypeName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Market",
      dataIndex: "marketName",
      key: "marketName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Inning",
      dataIndex: "inningsId",
      key: "inningsId",
      style: { width: "10%", textAlign: "center" },
      sort: true,
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      render: (text, record) => (
        <span
          onClick={() => {
            setResultModelVisible(true);
            setSelectedResult(record);
          }}
          className="d-flex justify-content-center gap-2"
          style={{ cursor: "pointer" }}
        >
          <div>{text}</div>
          <div><Tooltip title="Edit Result" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
           <i className="bx bx-edit-alt"></i>
          </Tooltip></div>
        </span>
      ),
      style: { width: "10%", textAlign: "center" },
      sort: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "20%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Result",
      key: "isResult",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Result"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isResult ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            setIsResultModalOpen(true);
            setResultModalData(record);
          }}
        >
          <i className={`bx ${record.isResult ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Cancel",
      key: "cancel",
      render: (text, record) => (
      <>
      {(!record?.isResult && record?.status == 5) &&
      <Tooltip title={"Cancel Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color="warning"
          size="sm"
          className="btn"
          onClick={() => {
            handleCancel(record);
          }}
        >
          Cancel
        </Button>
      </Tooltip>}
      </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Session Result",
    eventTypeSelect: true,
    competitionsListSelect: true,
    eventListSelect: true,
    rateSourceListSelect: true,
    resetButton: true,
    reloadButton: true,
    importExport: false,
    teamsList: false,
    isDateRange: true,
    marketTypeSelect: true,
    categorySelect: true,
  };

  const handleReload = (value) => {
    fetchData();
    fetchMarketCategoriesList();
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchMarketCategoriesList();
  }, [isSearch, ratesource]);

  useEffect(()=>{
    if(commentaryId !== 0 && commentaryDetails?.eventTypeId && commentaryDetails?.competitionId && commentaryDetails?.eventId){
      setIsSearch(false)
      fetchEventTypeData();
      fetchCompetitionList(commentaryDetails?.eventTypeId);
      fetchEventList(commentaryDetails?.competitionId);
    } /* else {
      setIsSearch(true)
    } */
  },[commentaryId, commentaryDetails?.eventTypeId, commentaryDetails?.competitionId, commentaryDetails?.eventId])

  useEffect(() => {
    if (commentaryDetails?.eventTypeId && commentaryDetails?.competitionId && commentaryDetails?.eventId) {
      const event = eventTypes.find(e => e.eventTypeId === commentaryDetails.eventTypeId)
      const competition = competitionList.find(c => c.competitionId === commentaryDetails.competitionId)
      const eventListData = eventList.find(c => c.eventId === commentaryDetails.eventId)
  
      setSelectedTableElements({
        eventType: { value: event?.eventTypeId, label: event?.eventType },
        competition: { value: competition?.competitionId, label: competition?.competition },
        eventName: { value: eventListData?.eventId, label: eventListData?.eventName }
      });
    }
  }, [commentaryDetails?.eventTypeId, commentaryDetails?.competitionId, commentaryDetails?.eventId, competitionList, eventTypes, eventList]);

  useEffect(() => {
      if(mtAndCategories && selectedMarketType) {
        const categoriesData = mtAndCategories?.categories?.filter((item)=>item?.marketTypeId == selectedMarketType)
        setCategories(categoriesData || []);
      } else if(!selectedMarketType) {
        setCategories([]);
      }
  },[mtAndCategories, selectedMarketType])

  useEffect(() => {
    if(EventTypeActive){
     fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList(eventTypeId);
    } else if(!eventTypeId) {
      setCompetitionList([]);
      setEventList([]);
    }
  }, [eventTypeId]);

  useEffect(() => {
    if (competitionId) {
      fetchEventList(competitionId);
    } else {
      setEventList([]);
    }
  }, [competitionId]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Session Results" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            competitionList={competitionList}
            eventList={eventList}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            onAddNavigate={"/addEventMarkets"}
            handleReset={handleReset}
            handleReload={handleReload}
            reFetchData={fetchData}
            setDateRange={setDateRange}
            dateRange={dateRange}
            rateSourceList={rateSourceList}
            ratesource={ratesource}
            setRatesource={setRatesource}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            selectedTableElementsLogs={selectedTableElements}
            marketTypes={mtAndCategories?.marketTypes || []}
            categories={categories}
            setSelectedMarketType={setSelectedMarketType}
          />
          {resultModelVisible && (
            <ChangeSessionResult
              resultModelVisible={resultModelVisible}
              setResultModelVisible={setResultModelVisible}
              handleChange={handleChangeResult}
              singleCheck={checekedList}
              selectedResult={selectedResult}
              setSelectedResult={setSelectedResult}
            />
          )}
          {isResultModalOpen && (
            <SetResultModal
             isOpen={isResultModalOpen}
             toggle={() => setIsResultModalOpen(!isResultModalOpen)}
             data={resultModalData}
             fetchData={fetchData}
            />
          )}
        <CancelModal
          isOpen={isCancelModalOpen}
          toggle={() => setIsCancelModalOpen(!isCancelModalOpen)}
          data={cancelModalData}
          fetchData={fetchData}
        />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;