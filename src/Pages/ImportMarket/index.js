import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _, { isEqual } from "lodash";
import Select from "react-select";
import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_AUTO_EVENT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {
  resetTabSliceData,
  setSelectedMarketHistory,
  setSelectedMarket,
} from "../../Features/Tabs/importMarketSlice";

const Index = () => {
  const pageName = TAB_AUTO_EVENT;
  const globalPageSize = localStorage.getItem("pageSize")
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title =
    "Auto Events";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [rateSource, setRateSource] = useState(2);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [status, setStatus] = useState(0);
  const [dataToDB, setDataToDB] = useState({});
  const { selectedMarket, selectedMarketHistory } = useSelector(
    (state) => state.tabsData?.importMarket
  );
  const [tournamentList, setTournamentList] = useState([]);
  const [showtournamentList, setisShowTournamentList] = useState(false);
  const [eventTypeRefId, setEventTypeRefId] = useState("");
  const [StickHeader,setStickHeader] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [total, setTotal] = useState(0);
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
      .post(`/admin/ImportMarket/marketList`, { ...selectedMarket })
      .then((response) => {
        const apiData = response?.result?.appdata;
        setTotal(apiData?.length || 0); 
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
      .post(`/admin/ImportMarket/importEvent`, { ...val })
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
      .post(`/admin/ImportMarket/importEventWithMarket`, { ...val })
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
        ? "competition"
        : "eventType"
        }`,
      render: (text, record) => <span>{text?.id}</span>,
      key: `${selectedMarket?.isCompitition
        ? "competitionId"
        : "eventTypeId"
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
        style={{cursor:"pointer"}}
          onClick={() => {
            setData([])
            let currentRecord = [{
              label: text?.name, value: {
                refID: text?.id,
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
                refID: text?.id,
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
                }`]: text?.id,
              [`${selectedMarket?.isCompitition
                ? "competitionName"
                : selectedMarket?.isEvent
                  ? "eventName"
                  : "eventTypeName"
                }`]: text?.name,
            });
            if(!selectedMarket?.isCompitition){
            setisShowTournamentList(false)
            setEventTypeRefId(text?.id);
            }
            else if(selectedMarket?.isCompitition){
              fetchtournamentList(eventTypeRefId)
              setisShowTournamentList(true)
            }
          }}
        >
          <span>{text?.name}</span>
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
            if(showtournamentList && tournamentObject?.competitionId != 0){
              setDataToDB({
                ...dataToDB,
                eventName: text?.name,
                eventId: text?.id,
                timeZone: text?.timezone,
                countryCode: text?.countryCode || "",
                openDate: text?.openDate,
                venue: text?.venue || "",
                competitionName: tournamentObject?.competitionName || "", // Add competitionName here
                compId: tournamentObject?.competitionId,
              });
              addData({
                ...dataToDB,
                eventName: text?.name,
                eventId: text?.id,
                timeZone: text?.timezone,
                countryCode: text?.countryCode || "",
                openDate: text?.openDate,
                venue: text?.venue || "",
                competitionName: tournamentObject?.competitionName || "", // Add competitionName here
                compId: tournamentObject?.competitionId,
              });
            }
            else{
            setDataToDB({
              ...dataToDB,
              eventName: text?.name,
              eventId: text?.id,
              timeZone: text?.timezone,
              countryCode: text?.countryCode || "",
              openDate: text?.openDate,
              venue: text?.venue || "",
              compId: tournamentObject?.competitionId || 0,
            });
            addData({
              ...dataToDB,
              eventName: text?.name,
              eventId: text?.id,
              timeZone: text?.timezone,
              countryCode: text?.countryCode || "",
              openDate: text?.openDate,
              venue: text?.venue || "",
              compId: tournamentObject?.competitionId || 0,
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
      dataIndex: `event`,
      render: (text, record) => <span>{convertDateUTCToLocal(text?.openDate, 'index')}</span>,
      sort: true,
      key: "date",
      style: { width: "30%" },
    },
    {
      title: `Ref Id`,
      dataIndex: `event`,
      render: (text, record) => <span>{text?.id}</span>,
      key: 'eventId',
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Event",
      dataIndex: "event",
      render: (text, record) => (
        <div
        style={{cursor:"pointer"}}
          onClick={() => {
            let currentRecord = [{
              label: text?.name, value: {
                refID: text?.id,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(!selectedMarket?.isCompitition),
                isMarket: Boolean(selectedMarket?.isEvent)
              }
            }];
            let historyList = selectedMarketHistory
              ? [].concat(selectedMarketHistory, currentRecord)
              : currentRecord;
            dispatch(setSelectedMarketHistory(historyList));
            dispatch(
              setSelectedMarket({
                refID: text?.id,
                isAustralian: false,
                isEvent: Boolean(selectedMarket?.isCompitition),
                isCompitition: Boolean(!selectedMarket?.isCompitition),
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
                }`]: text?.id,
              [`${selectedMarket?.isCompitition
                ? "competitionName"
                : selectedMarket?.isEvent
                  ? "eventName"
                  : "eventTypeName"
                }`]: text?.name,
            });
          }}
        >
          <span>{text?.name}</span>
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
              categoryType: record?.categoryType,
              competitionName: tournamentObject?.competitionName || dataToDB?.competitionName,
              compId: tournamentObject?.competitionId || dataToDB?.competitionId,
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
              categoryType: record?.categoryType,
              competitionName: tournamentObject?.competitionName || dataToDB?.competitionName,
              compId: tournamentObject?.competitionId || dataToDB?.competitionId,
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
    title: "Auto Events",
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: true,
    isServerPagination: true,
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
    if(!selectedMarket?.isCompitition && !selectedMarket?.isEvent)
      {
       setisShowTournamentList(true)
      }
    if(selectedMarket?.isCompitition && selectedMarket?.isEvent){
         setisShowTournamentList(false);
         setTournamentObject({
          competitionId: "0",
          competitionName: "",
        });
       }
    if(!selectedMarket?.isCompitition && selectedMarket?.isEvent){
        setisShowTournamentList(false);
        setTournamentObject({
          competitionId: "0",
          competitionName: "",
        });
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
    setStickHeader(false)
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Auto Events" />
          {isLoading && <SpinnerModel />}

          <Table
            ref={finalizeRef}
            columns={selectedMarket?.isEvent ? columnsB : selectedMarket?.isMarket ? columnsC : columnsA}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
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
            setStickHeader = {StickHeader}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={setCurrentPage}
            setServerPageSize={setPageSize}
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
