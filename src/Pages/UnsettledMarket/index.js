import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  TAB_EVENT_MARKETS,
  PERMISSION_VIEW,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import CancelModal from "./CancelModal";
import ResultModal from "./ResultModal";
import "./modal.css";
import { Tooltip } from "antd";
import CancelAllModel from "./CancelAllModel";
import CancelSelectedModel from "./CancelSelectedModel";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_EVENT_MARKETS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_EVENT_MARKETS;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [cancelModalData, setCancelModalData] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [resultModalData, setResultModalData] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  // const [cancelAllModelVisable, setCancelAllModelVisable] = useState(false);
  const [cancelModelVisable, setCancelModelVisable] = useState(false);
  const [mtAndCategories, setMtAndCategories] = useState(null);
  const [selectedMarketType, setSelectedMarketType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [ratesource, setRatesource] = useState({
    rateSourceRefId: 1,
    rateSourceType: "Ratesource"
  })
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    setEventTypeActive(tableActions?.isActive)
    let payload = {
      ...(latestValueFromTable || tableActions),
      status: 4,
      rateSourceRefId : latestValueFromTable?.rateSourceRefId || ratesource?.rateSourceRefId,
      marketTypeId: latestValueFromTable?.marketTypeId || 0,
      marketTypeCategoryId: latestValueFromTable?.marketTypeId !== selectedMarketType ? 0 : latestValueFromTable?.marketTypeCategoryId || 0,
      eventTypeId: latestValueFromTable?.eventTypeId || 0,
      competitionId: latestValueFromTable?.eventTypeId !== eventTypeId ? 0 : latestValueFromTable?.competitionId || 0,
      eventId: (latestValueFromTable?.competitionId !== competitionId || latestValueFromTable?.eventTypeId !== eventTypeId) ? 0 : latestValueFromTable?.eventId || 0,
    };
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
      .post(`/admin/eventMarket/all`, payload)
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.eventMarketId);
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
  const fetchCompetitionList = async () => {
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
  const fetchEventList = async () => {
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.eventMarketId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.eventMarketId
      );
    } else {
      updateSingleCheck = [...checekedList, e.eventMarketId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleCancel = async (record) => {
    setCancelModalData(record);
    setIsCancelModalOpen(true);
  };
  const handleResult = async (record) => {
    setResultModalData(record);
    setIsResultModalOpen(true);
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
            checked={checekedList.includes(record.eventMarketId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "eventDate",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      key: "eventRefId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Id",
      dataIndex: "eventMarketId",
      key: "eventMarketId",
      style: { width: "5%" },
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
      title: "Event Type",
      dataIndex: "eventTypeName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventTypeName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Competition",
      dataIndex: "competitionName",
      key: "competitionName",
      sort: true,
      style: { width: "20%" },
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
      style: { width: "10%" },
      sort: true,
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "10%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Cancel",
      key: "cancel",
      render: (text, record) => (
        <Tooltip title={"Cancel Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color="danger"
            size="sm"
            className="btn"
            onClick={() => {
              handleCancel(record);
            }}
          >
            Cancel
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Set Result",
      key: "result",
      render: (text, record) => (
        <Tooltip title={"Set Result"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color="primary"
            size="sm"
            className="btn"
            onClick={() => {
              handleResult(record);
            }}
          >
            Set Result
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Unsettled Market",
    // isActive: true,
    eventTypeSelect: true,
    competitionsListSelect: true,
    eventListSelect: true,
    rateSourceListSelect: true,
    resetButton: true,
    reloadButton: true,
    isDateRange: true,
    // isCancelAllMarket: true,
    isCancelMarket: true,
    marketTypeSelect: true,
    categorySelect: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchMarketCategoriesList();
  }, [isSearch, ratesource]);

  useEffect(() => {
    if(mtAndCategories && selectedMarketType) {
      const categoriesData = mtAndCategories?.categories?.filter((item)=>item?.marketTypeId == selectedMarketType)
      setCategories(categoriesData || []);
    } else if(!selectedMarketType) {
      setCategories([]);
    }
  },[mtAndCategories, selectedMarketType])

  const handleReload = (value) => {
    fetchData();
    fetchMarketCategoriesList();
  };

  useEffect(() => {
    if(EventTypeActive){
     fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList();
    } else if(!eventTypeId) {
      setCompetitionList([]);
      setEventList([]);
    }
  }, [eventTypeId]);

  useEffect(() => {
    if (competitionId) {
      fetchEventList();
    } else {
      setEventList([]);
    }
  }, [competitionId]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Unsettled Market" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            // cancelAllModelFunction={setCancelAllModelVisable}
            cancelModelFunction={setCancelModelVisable}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            competitionList={competitionList}
            eventList={eventList}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
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
            marketTypes={mtAndCategories?.marketTypes || []}
            categories={categories}
            setSelectedMarketType={setSelectedMarketType}
          />
        </Container>
        <CancelModal
          isOpen={isCancelModalOpen}
          toggle={() => setIsCancelModalOpen(!isCancelModalOpen)}
          data={cancelModalData}
          fetchData={fetchData}
        />
        <ResultModal
          isOpen={isResultModalOpen}
          toggle={() => setIsResultModalOpen(!isResultModalOpen)}
          data={resultModalData}
          fetchData={fetchData}
        />
        {/* <CancelAllModel
          cancelAllModelVisable={cancelAllModelVisable}
          setCancelAllModelVisable={setCancelAllModelVisable}
          singleCheck={checekedList}
          fetchData={fetchData}
        /> */}
        <CancelSelectedModel
          cancelModelVisable={cancelModelVisable}
          setCancelModelVisable={setCancelModelVisable}
          singleCheck={checekedList}
          fetchData={fetchData}
        />
      </div>
    </React.Fragment>
  );
};

export default Index;
