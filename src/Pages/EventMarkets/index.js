import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  TAB_EVENT_MARKETS,
  PERMISSION_ADD,
  PERMISSION_EDIT,
  PERMISSION_DELETE,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateLocalToUTC,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import CloseModal from "./CloseModal";
import { Tooltip } from "antd";
import CloseAllModel from "./CloseAllModel";
import CloseSuspendTimeModel from "../../components/Model/CloseSuspendTimeModel";
import CloseModel from "./CloseModel";

const Index = () => {
  const pageName = TAB_EVENT_MARKETS;
  const commentaryId = +sessionStorage.getItem('commentaryEventMarketId') || 0;
  const commentaryDetails = JSON.parse(sessionStorage.getItem('commentaryEventMarketDetails') || "{}");

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);
  document.title = TAB_EVENT_MARKETS;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(commentaryId ? commentaryDetails?.competitionId : null);
  const [closeModalData, setCloseModalData] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closeAllModelVisable, setCloseAllModelVisable] = useState(false);
  const [closeModelVisable, setCloseModelVisable] = useState(false);
  const [closeSuspendTimeModelVisible, setCloseSuspendTimeModelVisible] = useState(false);
  const [closeSuspendTimeRecord, setCloseSuspendTimeRecord] = useState({});
  const [delay, setDelay] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
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
      rateSourceRefId: latestValueFromTable?.rateSourceRefId || ratesource?.rateSourceRefId,
    };
    if (commentaryId !== 0) {
      payload = {
        ...(latestValueFromTable || tableActions),
        rateSourceRefId: latestValueFromTable?.rateSourceRefId || ratesource?.rateSourceRefId,
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
      .post(`/admin/eventMarket/all`, payload)
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.eventMarketId - b?.eventMarketId);
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

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/eventTypeList`, {
        isActive: EventTypeActive,
      })
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
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
      .catch((error) => { });
  };
  const fetchEventList = async (competitionId) => {
    await axiosInstance
      .post(`/admin/eventMarket/eventListByCompetitionId`, {
        competitionId: competitionId,
      })
      .then((response) => {
        setEventList(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
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

  const handleAllowPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/updateAllowMarket`, {
        eventMarketId: record.eventMarketId,
        [pType]: cState ? false : true,
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
      })
      .catch((error) => {
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

  const handleActiveInactivePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/activeInactiveMarket`, {
        eventMarketId: record.eventMarketId,
        [pType]: cState ? false : true,
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
      })
      .catch((error) => {
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/delete`, {
        eventMarketId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setCheckedList([]);
      });
  };

  const handleCloseSuspendTime = async () => {
    try {
      const response = await axiosInstance.post(
        "/admin/eventMarket/closeSuspendTime",
        {
          eventMarketId: closeSuspendTimeRecord?.eventMarketId,
          afterSuspendTime: closeSuspendTimeRecord?.afterSuspendTime || null,
          afterCloseTime: closeSuspendTimeRecord?.afterCloseTime || null,
        }
      );
      setCloseSuspendTimeModelVisible(false);
      fetchData();
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      setCloseSuspendTimeModelVisible(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handleDelay = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/setdelay`, {
        eventMarketId: checekedList,
        delay: +delay,
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
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setCheckedList([]);
      });
  };

  const handleReset = (value) => {
    fetchData(value);
  };
  const handleEdit = (id) => {
    navigate("/addEventMarket", { state: { userId: id } });
  };
  const handleSL = (details) => {
    const url = new URL(window.location.origin + "/marketLogs");
    sessionStorage.setItem('eventMarketLogId', "" + details?.eventMarketId);
    sessionStorage.setItem('eventMarketLogDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };
  const handleDS = (details) => {
    const url = new URL(window.location.origin + "/marketDataLogs");
    sessionStorage.setItem('eventMarketDataLogId', "" + details?.eventMarketId);
    sessionStorage.setItem('eventMarketDataLogDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };
  const handleClose = async (record) => {
    setCloseModalData(record);
    setIsCloseModalOpen(true);
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

  const statusList = [
    {
      statusType: "All",
      statusId: -1
    },
    {
      statusType: "NotOpen",
      statusId: 0
    },
    {
      statusType: "Open",
      statusId: 1
    },
    {
      statusType: "Inactive",
      statusId: 2
    },
    {
      statusType: "Suspend",
      statusId: 3
    },
    {
      statusType: "Close",
      statusId: 4
    },
    {
      statusType: "Settled",
      statusId: 5
    },
    {
      statusType: "Cancel",
      statusId: 6
    },
  ]

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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleEdit(record.eventMarketId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
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
      title: "Event Type",
      dataIndex: "eventTypeName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventTypeName",
      style: { width: "20%" },
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
      style: { width: "20%" },
    },
    {
      title: "Market",
      dataIndex: "marketName",
      key: "marketName",
      style: { width: "20%" },
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
      style: { width: "20%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Delay",
      dataIndex: "delay",
      key: "delay",
      style: { width: "5%", textAlign: "center" },
      sort: true,
    },
    {
      title: "Allow",
      key: "isAllow",
      render: (text, record) => (
        <Tooltip title={"Allow/Disable Event Market"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isAllow ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleAllowPermissions("isAllow", record, record.isAllow);
            }}
          >
            <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={"Active/Inactive Event Market"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleActiveInactivePermissions(
                "isActive",
                record,
                record.isActive
              );
            }}
          >
            <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Close",
      key: "close",
      render: (text, record) => (
        <>
          <Tooltip title={"Close Market"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color="danger"
              size="sm"
              className="btn"
              onClick={() => {
                handleClose(record);
              }}
            >
              C
            </Button>{" "}
          </Tooltip>
        </>
      ),
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      style: { width: "5%", textAlign: "center" },
      sort: true,
      render: (text, record) => {
        return (record?.marketTypeId == marketTypeObj?.Fancy || record?.marketTypeId == marketTypeObj?.LineMarket)
          ? text
          : record?.resultRunner;
      }
    },
    {
      render: (text, record) => (
        <>
          <Tooltip title={"View Status Logs"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color="primary"
              size="sm"
              className="btn"
              onClick={() => {
                handleSL(record);
              }}
            >
              SL
            </Button>
          </Tooltip>{" "}
          <Tooltip title={"View Data Logs"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color="primary"
              size="sm"
              className="btn"
              onClick={() => {
                handleDS(record);
              }}
            >
              DS
            </Button>
          </Tooltip>
          <Tooltip title={"Close Suspend Time"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color="primary"
              size="sm"
              className="btn mx-1"
              onClick={() => {
                setCloseSuspendTimeModelVisible(true);
                setCloseSuspendTimeRecord(record);
              }}
            >
              AT
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "10%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Event Markets",
    // isActive: true,
    eventTypeSelect: true,
    competitionsListSelect: true,
    eventListSelect: true,
    statusListSelect: true,
    rateSourceListSelect: true,
    resetButton: true,
    reloadButton: true,
    delayTextBox: true,
    importExport: false,
    teamsList: false,
    isDateRange: true,
    isCloseAllMarket: true,
    isCloseMarket: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, ratesource]);

  const handleReload = (value) => {
    fetchData();
  };

  useEffect(() => {
    if (EventTypeActive) {
      fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList(eventTypeId);
    }
  }, [eventTypeId]);
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Event Markets" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            closeAllModelFunction={setCloseAllModelVisable}
            closeMarketModelFunction={setCloseModelVisable}
            onAddNavigate={"/addEventMarket"}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            competitionList={competitionList}
            eventList={eventList}
            statusList={statusList}
            rateSourceList={rateSourceList}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            handleReset={handleReset}
            handleReload={handleReload}
            reFetchData={fetchData}
            delay={delay}
            setDelay={setDelay}
            handleDelay={handleDelay}
            selectedTableElementsLogs = {selectedTableElements}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            setDateRange={setDateRange}
            dateRange={dateRange}
            ratesource={ratesource}
            setRatesource={setRatesource}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
        </Container>
        <CloseModal
          isOpen={isCloseModalOpen}
          toggle={() => setIsCloseModalOpen(!isCloseModalOpen)}
          data={closeModalData}
          fetchData={fetchData}
        />
        <CloseAllModel
          closeAllModelVisable={closeAllModelVisable}
          setCloseAllModelVisable={setCloseAllModelVisable}
          singleCheck={checekedList}
          fetchData={fetchData}
        />
        <CloseModel
          closeModelVisable={closeModelVisable}
          setCloseModelVisable={setCloseModelVisable}
          singleCheck={checekedList}
          fetchData={fetchData}
        />
        {closeSuspendTimeModelVisible &&
          <CloseSuspendTimeModel
            closeSuspendTimeModelVisible={closeSuspendTimeModelVisible}
            setCloseSuspendTimeModelVisible={setCloseSuspendTimeModelVisible}
            handleCloseSuspendTime={handleCloseSuspendTime}
            closeSuspendTimeRecord={closeSuspendTimeRecord}
            setCloseSuspendTimeRecord={setCloseSuspendTimeRecord}
          />}
      </div>
    </React.Fragment>
  );
};

export default Index;
