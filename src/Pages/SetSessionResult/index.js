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
import {
  checkPermission,
  convertDateLocalToUTC,
  convertDateUTCToLocalWithoutSec,
  convertDateUTCToLocalWithoutSec24,
  convertDateUtcFormatWithoutSec,
  convertDateUtcFormatWithoutSec24
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChangeSessionResult } from "../../components/Model/ChangeSessionResult";
import { Tooltip } from "antd";
import SetResultModal from "./SetResultModal";
import CancelModal from "./CancelModal";
import { isEmpty, isEqual } from "lodash";
import ResultSelectedModel from "./ResultSelectedModel";

const Index = () => {
  const pageName = TAB_SET_SESSION_RESULT;
  const commentaryId = +sessionStorage.getItem("sessionResultId") || 0;
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("sessionResultDetails") || "{}"
  );

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_SET_SESSION_RESULT;
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(
    commentaryId ? commentaryDetails?.competitionId : null
  );
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
  const [dataIndexList, setDataIndexList] = useState([]);
  const [resultModelVisable, setResultModelVisable] = useState(false);
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
    const data = latestValueFromTable || tableActions;
    setEventTypeActive(tableActions?.isActive);
    let payload = {
      ...data,
      rateSourceRefId: data?.rateSourceRefId || ratesource?.rateSourceRefId,
      marketTypeId: data?.marketTypeId || 0,
      marketTypeCategoryId:
        data?.marketTypeId !== selectedMarketType
          ? 0
          : data?.marketTypeCategoryId || 0,
      eventTypeId: data?.eventTypeId || 0,
      competitionId:
        data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
      commentaryId:
        data?.competitionId !== competitionId ||
        data?.eventTypeId !== eventTypeId
          ? 0
          : data?.commentaryId || 0,
    };
    if (commentaryId !== 0) {
      payload = {
        ...data,
        commentaryId: commentaryId,
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
      };
    }
    if (data?.eventTypeId === null) {
      payload.competitionId = null;
      payload.commentaryId = null;
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
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
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
        isResult: val,
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
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "ID",
      dataIndex: "eventMarketId",
      key: "eventMarketId",
      sort: true,
      style: { width: "10%" },
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
        <span>
          {`${record.eventTypeName || ""}/ ${record.competitionName || ""}/ ${
            record.eventName || ""
          }`}
        </span>
      ),
      style: { width: "30%" },
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "20%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
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
          <div>
            <Tooltip
              title="Edit Result"
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <i className="bx bx-edit-alt"></i>
            </Tooltip>
          </div>
        </span>
      ),
      style: { width: "10%", textAlign: "center" },
      sort: true,
    },
    {
      title: "Result",
      key: "isResult",
      render: (text, record) => (
        <Tooltip
          title={"Result"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isResult ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              setIsResultModalOpen(true);
              setResultModalData(record);
            }}
          >
            <i
              className={`bx ${record.isResult ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
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
      title: "Event Id",
      dataIndex: "eventRefId",
      key: "eventRefId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Cancel",
      key: "cancel",
      render: (text, record) => (
        <>
          {!record?.isResult && record?.status == 5 && (
            <Tooltip
              title={"Cancel Market"}
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
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
            </Tooltip>
          )}
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
    isDateTypeSelect: true,
    marketTypeSelect: true,
    categorySelect: true,
    isResultMarket: true,
  };

  const handleReload = (value) => {
    fetchData();
    // fetchMarketCategoriesList();
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

  useEffect(() => {
    if (EventTypeActive) {
      fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList(eventTypeId);
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
            resultModelFunction={setResultModelVisable}
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
            dateType={dateType}
            setDateType={setDateType}
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
          <ResultSelectedModel
            resultModelVisable={resultModelVisable}
            setResultModelVisable={setResultModelVisable}
            singleCheck={checekedList}
            fetchData={fetchData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
