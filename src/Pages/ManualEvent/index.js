import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import {
  ERROR,
  PERMISSION_VIEW,
  PERMISSION_DELETE,
  SUCCESS,
  TAB_MANUAL_EVENT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {
  setSelectedMarketHistory,
  setSelectedMarket,
} from "../../Features/Tabs/manualEventSlice";

const Index = () => {
  const pageName = TAB_MANUAL_EVENT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title =
    "Manual Events";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [rateSource, setRateSource] = useState(2);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [status, setStatus] = useState(0);
  const [dataToDB, setDataToDB] = useState({});
  const { selectedMarket, selectedMarketHistory } = useSelector(
    (state) => state.tabsData?.manualEvent
  );

  const [tournamentList, setTournamentList] = useState([]);
  const [showtournamentList, setisShowTournamentList] = useState(false);
  const [eventTypeRefId, setEventTypeRefId] = useState("");


  const [tournamentObject, setTournamentObject] = useState({
    competitionId: 0,
    competitionName: "",
  });

  // Define handleClick function to update state
  const handleTournamentObjectClick = (val) => {
    setTournamentObject({
      competitionId: val.value.toString(),
      competitionName: val.label,
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/manualEvent/marketList`, { ...selectedMarket })
      .then((response) => {
        const apiData = response?.result?.appdata;
        setData(apiData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const addData = async (val) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/manualEvent/importEvent`, { ...val })
      .then((response) => {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
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

  const addMarketData = async (val) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/manualEvent/importEventWithMarket`, { ...val })
      .then((response) => {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
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

  //table columns
  const columnsA = [
    {
      title: `Ref Id`,
      dataIndex: `${selectedMarket?.isCompitition
        ? "competitionID"
        : "eventTypeID"
        }`,
      render: (text, record) => <span>{text}</span>,
      key: `${selectedMarket?.isCompitition
        ? "competitionID"
        : "eventTypeID"
        }`,
      sort: true,
      style: { width: "20%" },
    },
    {
      title: `${selectedMarket?.isCompitition
        ? "Competition"
        : "Event Type"
        }`,
      dataIndex: `${selectedMarket?.isCompitition
        ? "competition"
        : "eventType"
        }`,
      render: (text, record) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setData([])
            let currentRecord = [{
              label: text, value: {
                refID: selectedMarket?.isCompitition ? record?.competitionID : record?.eventTypeID,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(!selectedMarket?.isCompitition),
              }
            }];
            let historyList = selectedMarketHistory
              ? [].concat(selectedMarketHistory, currentRecord)
              : currentRecord;
            dispatch(setSelectedMarketHistory(historyList));
            dispatch(
              setSelectedMarket({
                refID: selectedMarket?.isCompitition ? record?.competitionID : record?.eventTypeID,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(!selectedMarket?.isCompitition),
              })
            );
            setStatus(
              selectedMarket?.isCompitition
                ? 2
                : 1
            )
            setDataToDB({
              ...dataToDB,
              [`${selectedMarket?.isCompitition
                ? "competitionId"
                : selectedMarket?.isEvent
                  ? "eventId"
                  : "eventTypeId"
                }`]: selectedMarket?.isCompitition ? record?.competitionID : selectedMarket?.isEvent ? record?.eventID : record?.eventTypeID,
              [`${selectedMarket?.isCompitition
                ? "competitionName"
                : selectedMarket?.isEvent
                  ? "eventName"
                  : "eventTypeName"
                }`]: text,
            });

            if(!selectedMarket?.isCompitition){
              setisShowTournamentList(false)
              setEventTypeRefId(record?.eventTypeID);
              }
              else if(selectedMarket?.isCompitition){
                fetchtournamentList(eventTypeRefId)
                setisShowTournamentList(true)
              }

          }}
        >
          <span>{text}</span>
        </div>
      ),
      key: `${selectedMarket?.isCompitition
        ? "competition"
        : "eventType"
        }`,
      sort: true,
      style: { width: "80%" },
    },
  ];
  const columnsB = [
    selectedMarket?.isEvent && {
      title: "Import",
      dataIndex: `${selectedMarket?.isCompitition
        ? "competition"
        : selectedMarket?.isEvent
          ? "event"
          : "eventType"
        }`,
      render: (text, record) => (
        <button
          color={"primary"}
          size="sm"
          className="btn-primary"
          onClick={() => {
            if(showtournamentList && tournamentObject?.competitionId !== 0){
              setDataToDB({
                ...dataToDB,
                eventName: text,
                eventId: record?.eventID,
                timeZone: record?.timezone || "",
                countryCode: record?.countryCode || "",
                openDate: record?.eventDate,
                venue: record?.venue || "",
                competitionName: tournamentObject?.competitionName || "", // Add competitionName here
                competitionId: tournamentObject?.competitionId,
              });
              addData({
                ...dataToDB,
                eventName: text,
                eventId: record?.eventID,
                timeZone: record?.timezone || "",
                countryCode: record?.countryCode || "",
                openDate: record?.eventDate,
                venue: record?.venue || "",
                competitionName: tournamentObject?.competitionName || "", // Add competitionName here
                competitionId: tournamentObject?.competitionId,
              });
            }
            else{
              setDataToDB({
                ...dataToDB,
                eventName: text,
                eventId: record?.eventID,
                timeZone: record?.timezone || "",
                countryCode: record?.countryCode || "",
                openDate: record?.eventDate,
                venue: record?.venue || "",
              });
              addData({
                ...dataToDB,
                eventName: text,
                eventId: record?.eventID,
                timeZone: record?.timezone || "",
                countryCode: record?.countryCode || "",
                openDate: record?.eventDate,
                venue: record?.venue || "",
              });
            }
          }}
        >
          <i className="bx bx-plus"></i>
        </button>
      ),
      key: "eventTypeId",
      style: { width: "20%" },
    },
    {
      title: "Date",
      dataIndex: `eventDate`,
      render: (text, record) => <span>{convertDateUTCToLocal(text, 'index')}</span>,
      sort: true,
      key: "eventDate",
      style: { width: "30%" },
    },
    {
      title: `Ref Id`,
      dataIndex: `eventID`,
      render: (text, record) => <span>{text}</span>,
      key: 'eventID',
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Event",
      dataIndex: "event",
      render: (text, record) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            let currentRecord = [{
              label: text, value: {
                refID: record?.eventID,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(selectedMarket?.isCompitition),
                isMarket: Boolean(selectedMarket?.isEvent)
              }
            }];
            let historyList = selectedMarketHistory
              ? [].concat(selectedMarketHistory, currentRecord)
              : currentRecord;
            dispatch(setSelectedMarketHistory(historyList));
            dispatch(
              setSelectedMarket({
                refID: record?.eventID,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(selectedMarket?.isCompitition),
                isMarket: Boolean(selectedMarket?.isEvent)
              })
            );
            setDataToDB({
              ...dataToDB,
              [`${selectedMarket?.isCompitition
                ? "competitionId"
                : selectedMarket?.isEvent
                  ? "eventId"
                  : "eventTypeId"
                }`]: selectedMarket?.isCompitition ? record?.competitionID : selectedMarket?.isEvent ? record?.eventID : record?.eventTypeID,
              [`${selectedMarket?.isCompitition
                ? "competitionName"
                : selectedMarket?.isEvent
                  ? "eventName"
                  : "eventTypeName"
                }`]: text,
              [`${selectedMarket?.isEvent
                  && "openDate"
                }`]: selectedMarket?.isEvent && record?.eventDate
            });
          }}
        >
          <span>{text}</span>
        </div>
      ),
      key: "event",
      sort: true,
      style: { width: "30%" },
    },
  ];
  const columnsC = [
    selectedMarket?.isMarket && {
      title: "Import",
      dataIndex: `${selectedMarket?.isMarket
        ? "marketName"
        : selectedMarket?.isCompitition
          ? "competition"
          : selectedMarket?.isEvent
            ? "event"
            : "eventType"
        }`,
      render: (text, record) => (
        <button
          color={"primary"}
          size="sm"
          className="btn-primary"
          onClick={() => {
            setDataToDB({
              ...dataToDB,
              marketName: text,
              marketID: record?.marketID,
              marketStatus: record?.marketStatus,
              marketTypeName: record?.marketTypeName,
              marketType: record?.marketType,
              runner: record?.runner,
              rateSource: rateSource, 
            });
            addMarketData({
              ...dataToDB,
              marketName: text,
              marketID: record?.marketID,
              marketStatus: record?.marketStatus,
              marketTypeName: record?.marketTypeName,
              marketType: record?.marketType,
              runner: record?.runner,
              rateSource: rateSource,
            });
          }}
        >
          <i className="bx bx-plus"></i>
        </button>
      ),
      key: "marketType",
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: `matchDate`,
      render: (text, record) => <span>{convertDateUTCToLocal(text, 'index')}</span>,
      sort: true,
      key: "matchDate",
      style: { width: "10%" },
    },
    {
      title: `Ref Id`,
      dataIndex: `marketID`,
      key: 'marketID',
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
      title: "Market Type",
      dataIndex: "marketTypeName",
      key: "marketTypeName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Match",
      dataIndex: "matchName",
      key: "matchName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Runner",
      dataIndex: "runner",
      render: (text, record) => {
        const logObject = text;
        const logItems = logObject && Object.entries(logObject).map(([key, value]) => (
          <span key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" ? JSON.stringify(value) : value}<br />
          </span>
        ));
        return <div>{logItems}</div>;
      },
      key: "runner",
      style: { width: "10%" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Manual Events",
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: true,
  };

  const handleBreadCrumbsClick = (value) => {
    let historyList = _.clone(selectedMarketHistory);
    const index = historyList.findIndex((item) => item.value === value);
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    dispatch(setSelectedMarketHistory(historyList));
    dispatch(
      setSelectedMarket({
        ...value
      })
    );

    if(!selectedMarket?.isCompitition)
    {
     setisShowTournamentList(false)
    }
     else if(selectedMarket?.isCompitition){
       setisShowTournamentList(true)
     }
  };

  const fetchtournamentList = async (refId) => {
    await axiosInstance
      .post(`/admin/ImportMarket/competitionList`, { eventTypeRefId: refId })
      .then((response) => {
        setTournamentList(response.result);
      })
      .catch((error) => { });
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    setData([])
    fetchData();
  }, [selectedMarket]);

  useEffect(() => {
    dispatch(
      setSelectedMarketHistory([
        {
          label: "Home",
          value: {
            refID: 0,
            isAustralian: false,
            isEvent: false,
            isCompitition: false,
          }
        },
      ])
    );
    dispatch(
      setSelectedMarket({
        refID: 0,
        isAustralian: false,
        isEvent: false,
        isCompitition: false,
      })
    );
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Manual Events" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={selectedMarket?.isEvent ? columnsB : selectedMarket?.isMarket ? columnsC : columnsA}
            dataSource={data}
            tableElement={tableElement}
            changeOrderApiName="eventType"
            singleCheck={checekedList}
            reFetchData={fetchData}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            onBreadCrumbsClick={handleBreadCrumbsClick}
            breadCrumbs={selectedMarketHistory}
            showtournamentList={showtournamentList}
            tournamentList = {tournamentList}
            onTournamentisChanges = {handleTournamentObjectClick}
          />
           <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            // handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
