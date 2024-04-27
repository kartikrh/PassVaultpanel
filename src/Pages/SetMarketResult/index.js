import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  TAB_SET_MARKETS_RESULT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_SET_MARKETS_RESULT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_SET_MARKETS_RESULT;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [isSearch, setIsSearch] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    setEventTypeActive(tableActions?.isActive)
    let payload = {
      ...(latestValueFromTable || tableActions),
    };
    if (isSearch) {
      payload = {
        ...payload,
        ...dateRange,
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
      .post(`/admin/eventMarket/eventListByCompetitionId`, {
        competitionId: competitionId,
      })
      .then((response) => {
        setEventList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };

  const handleAllowPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/setMarketIsResult`, {
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
    {
      title: "Center ID",
      dataIndex: "commentaryId",
      key: "commentaryId",
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
      title: "Is Result",
      key: "isResult",
      render: (text, record) => (
        <Button
          color={`${record.isResult ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleAllowPermissions("isResult", record, record.isResult);
          }}
        >
          <i className={`bx ${record.isResult ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Set Market Result",
    eventTypeSelect: true,
    competitionsListSelect: true,
    eventListSelect: true,
    resetButton: true,
    importExport: false,
    teamsList: false,
    isDateRange: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch]);

  useEffect(() => {
    if(EventTypeActive){
     fetchEventTypeData();
    }
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList();
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Set Market Results" />
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
            reFetchData={fetchData}
            setDateRange={setDateRange}
            dateRange={dateRange}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
