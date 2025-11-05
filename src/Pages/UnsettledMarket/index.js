import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual } from "lodash";
import {
  TAB_EVENT_MARKETS,
  PERMISSION_VIEW,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateLocalToUTC,
  convertDateUTCToLocalWithoutSec,
  convertDateUTCToLocalWithoutSec24,
  convertDateUtcFormatWithoutSec,
  convertDateUtcFormatWithoutSec24
} from "../../components/Common/Reusables/reusableMethods";
import CancelModal from "./CancelModal";
import ResultModal from "./ResultModal";
import "./modal.css";
import { Tooltip } from "antd";
import CancelAllModel from "./CancelAllModel";
import CancelSelectedModel from "./CancelSelectedModel";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_EVENT_MARKETS;
  const commentaryId = +sessionStorage.getItem("closeMarketId") || 0;
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("closeMarketDetails") || "{}"
  );
  const globalPageSize = localStorage.getItem("pageSize");
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
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
  const [competitionId, setCompetitionId] = useState(
    commentaryId ? commentaryDetails?.competitionId : null
  );
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
  const [dateType, setDateType] = useState( globalDateType || {
    label: "Local Timezone",
    value: 1,
  });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [ratesource, setRatesource] = useState({
    rateSourceRefId: 1,
    rateSourceType: "Ratesource",
  });
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    eventName: null,
  });
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchedData, setTableSearchedData] = useState([]);

  useEffect(() => {
    if (commentaryId !== 0) {
      setEventTypeId(commentaryDetails.eventTypeId);
    }
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    // Use latestValueFromTable if available; otherwise, fallback to tableActions
    const dataSource = latestValueFromTable || tableActions;

    setEventTypeActive(dataSource?.isActive);

    let payload = {
      ...dataSource,
      status: 4,
      rateSourceRefId:
        dataSource?.rateSourceRefId || ratesource?.rateSourceRefId,
      marketTypeId: dataSource?.marketTypeId || 0,
      marketTypeCategoryId:
        dataSource?.marketTypeId !== selectedMarketType
          ? 0
          : dataSource?.marketTypeCategoryId || 0,
      eventTypeId: dataSource?.eventTypeId || 0,
      competitionId:
        dataSource?.eventTypeId !== eventTypeId
          ? 0
          : dataSource?.competitionId || 0,
      commentaryId:
        dataSource?.competitionId !== competitionId ||
        dataSource?.eventTypeId !== eventTypeId
          ? 0
          : dataSource?.commentaryId || 0,
    };
    if (commentaryId !== 0) {
      payload = {
        ...dataSource,
        rateSourceRefId:
          dataSource?.rateSourceRefId || ratesource?.rateSourceRefId,
        commentaryId: commentaryId,
        status: 4,
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
      };
    }
    if (dataSource?.eventTypeId === null) {
      payload.competitionId = null;
      payload.commentaryId = null;
    }
    await axiosInstance
      .post(`/admin/eventMarket/all`, payload)
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = apiData.map((ele) => ele?.eventMarketId);
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchMarketCategoriesList = async () => {
    await axiosInstance
      .post("/admin/marketTemplate/mtAndCategories", {})
      .then((response) => {
        setMtAndCategories(response?.result);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

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
    setIsSearch(false)
    fetchData();
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

  useEffect(() => {
    if (
      commentaryId !== 0 &&
      commentaryDetails?.eventTypeId &&
      commentaryDetails?.competitionId &&
      commentaryDetails?.commentaryId
    ) {
      setIsSearch(false);
      fetchEventTypeData();
      fetchCompetitionList(commentaryDetails?.eventTypeId);
      fetchEventList(commentaryDetails?.competitionId);
    } /* else {
            setIsSearch(true)
        } */
  }, [
    commentaryId,
    commentaryDetails?.eventTypeId,
    commentaryDetails?.competitionId,
    commentaryDetails?.commentaryId,
  ]);

  useEffect(() => {
    if (
      commentaryDetails?.eventTypeId &&
      commentaryDetails?.competitionId &&
      commentaryDetails?.commentaryId
    ) {
      const event = eventTypes.find(
        (e) => e.eventTypeId === commentaryDetails.eventTypeId
      );
      const competition = competitionList.find(
        (c) => c.competitionId === commentaryDetails.competitionId
      );
      const eventListData = eventList.find(
        (c) => c.commentaryId === commentaryDetails.commentaryId
      );

      setSelectedTableElements({
        eventType: { value: event?.eventTypeId, label: event?.eventType },
        competition: {
          value: competition?.competitionId,
          label: competition?.competition,
        },
        eventName: {
          value: eventListData?.commentaryId,
          label: eventListData?.eventName,
        },
      });
    }
  }, [
    commentaryDetails?.eventTypeId,
    commentaryDetails?.competitionId,
    commentaryDetails?.commentaryId,
    competitionList,
    eventTypes,
    eventList,
  ]);

  const rateSourceList = [
    {
      rateSourceType: "Ratesource",
      rateSourceRefId: 1,
    },
    {
      rateSourceType: "External",
      rateSourceRefId: 2,
    },
  ];

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.eventMarketId)
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

  const  handleCurrentPageChange = (page) => {
    setCurrentPage(page);
    setCheckedList([])
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCheckedList([])
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
      title: "ID",
      dataIndex: "eventMarketId",
      key: "eventMarketId",
      style: { width: "5%" },
      sort: true,
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {dateType?.value == 1
            ? convertDateUTCToLocalWithoutSec24(text, "index")
            : convertDateUtcFormatWithoutSec24(text, "index")}
        </span>
      ),
      key: "eventDate",
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
      title: "Event",
      key: "event",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {`${record.eventTypeName || ""}/ ${record.competitionName || ""}/ ${
            record.eventName || ""
          }`}
        </span>
      ),
      style: { width: "60%" },
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "10%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Market Type",
      key: "market",
      render: (text, record) => (
        <span>
          {`${record.marketTypeName || ""}/ ${record.categoryName || ""}`}
        </span>
      ),
      style: { width: "60%" },
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
      title: "Inning",
      dataIndex: "inningsId",
      key: "inningsId",
      style: { width: "10%", textAlign: "center" },
      sort: true,
    },  
    {
      title: "Result",
      key: "result",
      render: (text, record) => (
        <Tooltip
          title={"Result"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color="primary"
            size="sm"
            className="btn"
            onClick={() => {
              handleResult(record);
            }}
          >
            Result
          </Button>
        </Tooltip>
      ),
      style: { width: "10%", textAlign: "center" },
    },  
    
    {
      render: (text, record) => (
        <>
          <Tooltip
            title={"View Status Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color="primary"
              size="sm"
              className="btn slBtn"
              onClick={() => {
                handleSL(record);
              }}
            >
              SL
            </Button>
          </Tooltip>{" "}
          <Tooltip
            title={"View Data Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color="primary"
              size="sm"
              className="btn dsBtn"
              onClick={() => {
                handleDS(record);
              }}
            >
              DS
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Cancel",
      key: "cancel",
      render: (text, record) => (
        <Tooltip
          title={"Cancel Market"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
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
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    fetchData();
    fetchMarketCategoriesList();
  }, [isSearch, ratesource, permissionObj]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (mtAndCategories && selectedMarketType) {
      const categoriesData = mtAndCategories?.categories?.filter(
        (item) => item?.marketTypeId == selectedMarketType
      );
      setCategories(categoriesData || []);
    } else if (!selectedMarketType) {
      setCategories([]);
    }
  }, [mtAndCategories, selectedMarketType]);

  const handleReload = (value) => {
    fetchData();
    // fetchMarketCategoriesList();
  };

  useEffect(() => {
    if (EventTypeActive) {
      fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList();
    } else if (!eventTypeId) {
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

  const handleDS = (details) => {
    const url = new URL(window.location.origin + "/marketDataLogs");
    sessionStorage.setItem("eventMarketDataLogId", "" + details?.eventMarketId);
    sessionStorage.setItem(
      "eventMarketDataLogDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
  };

  const handleSL = (details) => {
    const url = new URL(window.location.origin + "/marketLogs");
    sessionStorage.setItem("eventMarketLogId", "" + details?.eventMarketId);
    sessionStorage.setItem(
      "eventMarketLogDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
  };

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
            selectedTableElementsLogs={selectedTableElements}
            handleReload={handleReload}
            reFetchData={fetchData}
            setDateRange={setDateRange}
            dateRange={dateRange}
            rateSourceList={rateSourceList}
            ratesource={ratesource}
            setRatesource={setRatesource}
            isSearch={isSearch}
            dateType={dateType}
            setDateType={setDateType}
            setIsSearch={setIsSearch}
            marketTypes={mtAndCategories?.marketTypes || []}
            categories={categories}
            setSelectedMarketType={setSelectedMarketType}
            setParentPageSize={handlePageSizeChange}
            setParentCurrentPage={handleCurrentPageChange}
            setParentSearchedData={handleTableSearchedDataChange}
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
