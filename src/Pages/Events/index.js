import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEmpty, isEqual } from "lodash";
import { ERROR, MODULE_EVENTS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY, TAB_COMMENTARY_LIST, TAB_EVENT } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUTCToLocal, convertDateUTCToLocal24 } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";
import moment from "moment";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_EVENT
  const CommentaryListPage = TAB_COMMENTARY_LIST
  const CommentaryPage = TAB_COMMENTARY
  const finalizeRef = useRef(null);
  const didInitialFetch = useRef(false);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Events";
  const [data, setData] = useState([]);
  const [filledDropdownData, setFilledDropdownData] = useState(false);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [CompetitionId, setCompetitionId] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split('T')[0]}T00:00:00`,
    endDate: `${
      new Date().toISOString().split("T")[0]
    }T23:59`
  })
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null
  });
  const [userRefData, setUserRefData] = useState(false);
  const EventTypeId = +sessionStorage.getItem('CompetitionEventTypeId') || 0;
  const EventCompetitionId = +sessionStorage.getItem('EventCompetitionId') || 0;

  const commentaryPermission = checkPermission(permissionObj, CommentaryPage, PERMISSION_VIEW)
  const commentaryListPermission = checkPermission(permissionObj, CommentaryListPage, PERMISSION_VIEW)

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const fetchData = async (value) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/events/all`, {
        ...(value || tableActions),
        eventTypeId: EventTypeId ? EventTypeId : (value?.eventTypeId || tableActions?.eventTypeId) || 0,
        competitionId: EventCompetitionId ? EventCompetitionId : (value?.competitionId || tableActions?.competitionId) || 0,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.eventId - b?.eventId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.eventId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    if (value?.eventTypeId) {
      await axiosInstance
        .post(`/admin/events/competitionList`, {
          eventTypeId: value?.eventTypeId,
          isActive:true,
        })
        .then((response) => {
          setCompetitions(response.result);
          setIsLoading(false);
        })
        .catch((error) => { });
    }
  };
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/events/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/events/competitionList`, {
        eventTypeId: value
      })
      .then((response) => {
        setCompetitions(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.eventId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.eventId);
    } else {
      updateSingleCheck = [...checekedList, e.eventId];
    }
    setCheckedList(updateSingleCheck)
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/events/save`, {
        eventId: record.eventId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_EVENTS], password})
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
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
      .post(`/admin/events/delete`, {
        eventId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (id) => {
    navigate("/addEvents", { state: { userId: id } });
  };

  const handleReset = (value) => {
    fetchData(value)
    fetchCompetitionData()
  }

  const handleCommentaryClick = (details) => {
    const navUrl = (commentaryPermission && commentaryListPermission) ? "/Commentary" : commentaryPermission ? "/Commentary" : commentaryListPermission ? "/CommentaryList" : ''
    const url = new URL(window.location.origin + navUrl);
    sessionStorage.setItem(
      "commentaryCompetitionId",
      "" + details?.competitionId
    );
    sessionStorage.setItem(
      "commentaryEventTypeId",
      "" + details?.eventTypeId
    );
    // sessionStorage.setItem(
    //   "commentaryManualOddsMarketDetails",
    //   "" + JSON.stringify(details)
    // );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryCompetitionId");
    sessionStorage.removeItem("commentaryEventTypeId");
    // sessionStorage.removeItem("commentaryManualOddsMarketDetails");
  };

  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            onChange={() => {
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
              )
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
            checked={checekedList.includes(record.eventId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.eventId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    (commentaryPermission || commentaryListPermission) &&
      {
        title: "",
        dataIndex: "",
        key: "",
        render: (text, record) => {
          // const isMatchingCompetition =
          //   record?.competitionId === filledDropdownData?.competition?.value;
            
          // if (userRefData.competitionId != 0 && !isMatchingCompetition) return null; 
  
          return (
            <Tooltip
              title={"Commentary List"}
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <Button
                color={"primary"}
                size="sm"
                className="btn"
                onClick={() => handleCommentaryClick(record)}
              >
                CL
              </Button>
            </Tooltip>
          );
        },
        // sort: true,
        style: { width: "10%" },
      },
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{convertDateUTCToLocal24(text, 'index')}</span>
      ),
      key: "eventDate",
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      // render: (text, record) => (
      //   <span style={{ cursor: "pointer" }}>{text}</span>
      // ),
      key: "eventType",
      style: { width: "10%" },
    },
    {
      title: "Reference Id",
      dataIndex: "refId",
      key: "refId",
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      // render: (text, record) => (
      //   <span style={{ cursor: "pointer" }}>{text}</span>
      // ),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      style: { width: "40%" },
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
      render: (text, record) => text ? text : "N/A",
      style: { width: "10%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Event"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Full Name",
      dataIndex: "createdBy",
      // render: (text, record) => (
      //   <span style={{ cursor: "pointer" }}>{text}</span>
      // ),
      key: "createdBy",
      style: { width: "10%", textAlign: "center"},
    },
  ];

  //elements required
  const tableElement = {
    title: "Events",
    headerSelect: false,
    eventTypeSelect: true,
    competitionsSelect: true,
    isActive: true,
    resetButton: true,
    reloadButton: true,
    dateRange: true,
    loadData: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard")
    }
    fetchData({ isActive: true });
    fetchEventTypeData();
    fetchCompetitionData();
  }, [permissionObj]);

  useEffect(() => {
    const objToSave = {};
    let shouldFetchData = false;

    if (userRefData?.eventTypeId !== 0 && eventTypes && eventTypes.length > 0) {
      const matchedEvent = eventTypes.find(
        (item) => item.eventTypeId === userRefData?.eventTypeId
      );
      objToSave["eventType"] = {
        label: matchedEvent?.eventType,
        value: matchedEvent?.eventTypeId,
      };
    }

    if (competitions && competitions.length > 0) {
      if (userRefData?.competitionId !== 0) {
        const matchedCompetition = competitions.find(
          (item) => item.competitionId === userRefData?.competitionId
        );
        if (matchedCompetition) {
          objToSave["competition"] = {
            label: matchedCompetition.competition,
            value: matchedCompetition.competitionId,
          };
          shouldFetchData = true;
        }
      } else {
        shouldFetchData = true;
      }
    }

    setFilledDropdownData(objToSave);

    // Use a ref to track if we've already fetched data
    if (shouldFetchData && !didInitialFetch.current) {
      fetchData();
      didInitialFetch.current = true;
    }
  }, [eventTypes, competitions]);

  useEffect(() => {
    if (EventTypeId && EventCompetitionId) {
      const event = eventTypes.find(e => e.eventTypeId === EventTypeId)
      const competition = competitions.find(c => c.competitionId === EventCompetitionId)
      setSelectedTableElements({
        eventType: {value: event?.eventTypeId, label: event?.eventType},
        competition: {value: competition?.competitionId, label: competition?.competition},
      });
    }
  }, [eventTypes, EventTypeId, EventCompetitionId, competitions]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
    // fetchCompetitionData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Events" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            competitions={competitions}
            reFetchData={fetchData}
            singleCheck={checekedList}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addEvents"}
            setCompetitionId={setCompetitionId}
            setDateRange = {setDateRange}
            dateRange = {dateRange}
            selectedTableElementsLogs={selectedTableElements}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Events"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
