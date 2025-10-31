import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import CloseTabModel from "../../components/Model/CloseModel";
import CancelTabModel from "../../components/Model/CancelModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { CommentaryClone } from "../../components/Model/Clone";
import { isEqual, isEmpty } from "lodash";
import {
  ERROR,
  MODULE_COMMENTARY,
  MODULE_SINGLE_COMMENTARY,
  PERMISSION_ADD,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMMENTARY_LIST,
  WARNING,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocalWithoutSec,
  convertDateLocalToUTC,
  convertDateUtcFormatWithoutSec,
  convertDateUTCToLocalWithoutSec24,
  convertDateUtcFormatWithoutSec24,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChnageMatchTypeModel } from "../../components/Model/ChangeMatchType";
import { UpdateDayModel } from "../../components/Model/UpdateDayModel";
import { ChangeResultModel } from "../../components/Model/ChangeResult";
import { ChangeEventRefIdModel } from "../../components/Model/ChangeEventRefId";
import "../Commentary/CommentaryCss.css";
import { ChangeRunnerModel } from "../../components/Model/ChangeRunnerModel";
import { Tooltip } from "antd";
import AwardSelectionComponent from "../Commentary/CommentaryModels/AwardModal";
import { mapCommentaryStatus } from "../Commentary/functions";
import { DlsModal } from "../Commentary/CommentaryModels/DlsModal";
import LoadDataModal from "../../components/Model/LoadDataModal";
import GenerateModal from "../Commentary/GenerateModal";
import { ChangePythonType } from "../../components/Model/ChangePythonType";
import { loadInit } from "../../config";

const Index = () => {
  const pageName = TAB_COMMENTARY_LIST;

  const EventTypeId = +sessionStorage.getItem('commentaryEventTypeId');
  const EventRefId = +sessionStorage.getItem('commentaryEventRefId');
  const EventCompetitionId = +sessionStorage.getItem('commentaryCompetitionId') || 0;

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary List";
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [resultModelVisible, setResultModelVisible] = useState(false);
  const [eventRefModelVisible, setEventRefModelVisible] = useState(false);
  const [changePythonModel, setChangePythonModel] = useState(false);
  const [matchType, setMatchType] = useState("");
  const [selectedCommentary, setSelectedCommentary] = useState({});
  const [selectedPythonCommentary, setSelectedPythonCommentary] = useState({});
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedEventRef, setSelectedEventRef] = useState({});
  const [dlsModalCommentary, setDlsModalCommentary] = useState(false);
  const [cloneValues, setCloneValues] = useState({
    eventName: "",
    eventRefId: "",
  });
  const [isSearch, setIsSearch] = useState(EventRefId ? false : true);
  const [dateType, setDateType] = useState(globalDateType || {
    label: "Local Timezone",
    value: 1,
  });
  // const [dateRange, setDateRange] = useState({
  //   startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
  //   endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  // });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59:00`,
  });
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [closeModelVisible, setCloseModelVisible] = useState(false);
  const [cancelModelVisible, setCancelModelVisible] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [runnerModelVisible, setRunnerModelVisible] = useState(false);
  const [selectedCommentaryRunner, setSelectedCommentaryRunner] = useState({});
  const [showAwardModel, setShowAwardModel] = useState(undefined);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [generateModalData, setGenerateModalData] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [loadSingleDataModelVisible, setLoadSingleDataModelVisible] =
    useState(false);
  const [selectedCommentaryId, setSelectedCommentaryId] = useState(null);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [updateDayModelVisible, setUpdateDayModelVisible] = useState(false);
  const [selectedCommentaryDay, setSelectedCommentaryDay] = useState({});
  const [userRefData, setUserRefData] = useState(false);
  const [filledDropdownData, setFilledDropdownData] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [selectedTableElements, setSelectedTableElements] = useState({
      eventType: null,
      competition: null,
      scoringType: null,
      tpId: null
    });
  const didInitialFetch = useRef(false);
  let scorecardFrameUrl = null;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUserPermission = () => {
    const refData = JSON.parse(localStorage.getItem("refData"));
    setUserRefData(refData);
    fetchData(refData);
  };

  useEffect(() =>{
    fetchUserPermission();
  }, [])

  useEffect(() => {
    if (EventTypeId || EventCompetitionId) {
      setSelectedTableElements(prev => {
        const updated = { ...prev };

        if (EventTypeId) {
          const event = eventTypes.find(e => e.eventTypeId === EventTypeId);
          // console.log("event", event);
          updated.eventType = {
            value: event?.eventTypeId,
            label: event?.eventType,
          };
        }

        if (EventCompetitionId) {
          const competition = competitions.find(c => c.competitionId === EventCompetitionId);
          updated.competition = {
            value: competition?.competitionId,
            label: competition?.competition,
          };
        }

        return updated;
      });
    }
  }, [eventTypes, EventTypeId, EventCompetitionId, competitions]);


  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions;
    let payload = {
      ...data,
      eventTypeId: EventTypeId ? EventTypeId :data?.eventTypeId || 0,
      competitionId: EventCompetitionId ? EventCompetitionId :
        data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
    };
    if (!isEmpty(userRefData)) {
      if (userRefData.eventTypeId && userRefData.eventTypeId !== 0)
        payload["eventTypeId"] = userRefData.eventTypeId;
      if (userRefData.competitionId && userRefData.competitionId !== 0)
        payload["competitionId"] = userRefData.competitionId;
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(latestValueFromTable?.startDate ? latestValueFromTable?.startDate : dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable?.endDate ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/commentary/all`, payload)
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.commentaryId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
        // setEventTypes(eventTypes);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    if ((latestValueFromTable?.eventTypeId || userRefData.eventTypeId) ) {
      const valueToFetchFrom =
        userRefData.eventTypeId && +userRefData.eventTypeId !== 0
          ? userRefData.eventTypeId
          : latestValueFromTable?.eventTypeId;
      fetchCompetitionData(valueToFetchFrom);
    }
    
  };

  useEffect(() => {
    if(EventTypeId && !selectedTableElements.competition){
      fetchCompetitionData(EventTypeId)
    }
  }, [EventTypeId])

  useEffect(() => {
    const objToSave = {};
    let shouldFetchData = false;

    if (userRefData?.eventTypeId !== 0 && eventTypes && eventTypes.length > 0) {
      const matchedEvent = eventTypes.find(
        (item) => item.eventTypeId === userRefData?.eventTypeId
      );
      objToSave["eventType"] = {
        label: matchedEvent.eventType,
        value: matchedEvent.eventTypeId,
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

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/commentary/eventTypeList`, { isActive: true })
      .then((response) => {
        setEventTypes(response.result);
      })
      .catch((error) => {});
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/commentary/competitionListByEventTypeId`, {
        eventTypeId: value,
      })
      .then((response) => {
        setCompetitions(response.result);
      })
      .catch((error) => {});
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.commentaryId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.commentaryId
      );
    } else {
      updateSingleCheck = [...checekedList, e.commentaryId];
    }
    setCheckedList(updateSingleCheck);
  };
  const handleClose = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/closeCommentary`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setCloseModelVisible(false);
        if (response?.result?.callPredictions?.length > 0) {
          response.result.callPredictions.forEach((prediction) => {
            if (prediction?.predictioncallSuccess === false) {
              const predictionMessage = prediction?.predictionMessage;
              const endPoint = prediction?.endPoint;
              dispatch(
                updateToastData({
                  data: `${endPoint}\n${predictionMessage}`,
                  title: "Call Prediction",
                  type: WARNING,
                })
              );
            }
          });
        } else {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
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
  const handleCancel = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/cancelCommentary`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setCancelModelVisible(false);
        if (response?.result?.callPredictions?.length > 0) {
          response.result.callPredictions.forEach((prediction) => {
            if (prediction?.predictioncallSuccess === false) {
              const predictionMessage = prediction?.predictionMessage;
              const endPoint = prediction?.endPoint;
              dispatch(
                updateToastData({
                  data: `${endPoint}\n${predictionMessage}`,
                  title: "Call Prediction",
                  type: WARNING,
                })
              );
            }
          });
        } else {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
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
  const handleEdit = (id) => {
    navigate("/addCommentary", { state: { userId: id } });
  };
  const handleDetailsClick = (id) => {
    // navigate("/commentaryMaster", { state: { commentaryId: id } });
    sessionStorage.setItem("commentaryMasterId", "" + id);
    sessionStorage.setItem("commentary", "commentaryList");
    const url = new URL(window.location.origin + "/commentaryMaster");
    window.open(url.href, "_blank");
  };
  const handleUpdatePlayersClick = (details) => {
    // navigate("/updateCommentaryPlayer", {
    //   state: {
    //     commentaryId: details?.commentaryId,
    //     commentaryDetails: details,
    //   },
    // });
    localStorage.setItem(
      "updatePlayerCommentaryId",
      "" + details?.commentaryId
    );
    localStorage.setItem(
      "updatePlayerCommentaryDetails",
      "" + JSON.stringify(details)
    );
    const url = new URL(window.location.origin + "/updateCommentaryPlayer");
    window.open(url.href, "_blank");
  };
  const handleCommentaryLogsClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryLogs");
    sessionStorage.setItem("commentaryLogsId", "" + details?.commentaryId);
    sessionStorage.setItem(
      "commentaryLogsDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryLogsId");
    sessionStorage.removeItem("commentaryLogsDetails");
  };
  const handleUndoLogsClick = (details) => {
    const url = new URL(window.location.origin + "/undoLogs");
    sessionStorage.setItem("undoLogsId", "" + details?.commentaryId);
    sessionStorage.setItem("undoLogsDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("undoLogsId");
    sessionStorage.removeItem("undoLogsDetails");
  };
  const handleCommentaryEventSnapClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryEventSnap");
    sessionStorage.setItem("eventSnapId", "" + details?.commentaryId);
    sessionStorage.setItem("eventSnapDetails", "" + JSON.stringify(details));
    sessionStorage.setItem("eventSnapCommentaryHistory", true);
    window.open(url.href, "_blank");
  };
  const handleShortCommentaryClick = (id) => {
    // navigate("/shortCommentary", { state: { commentaryId: id } });
    localStorage.setItem("shortCommentaryId", "" + id);
    const url = new URL(window.location.origin + "/shortCommentary");
    window.open(url.href, "_blank");
  };
  const handleUpdateCommentaryClick = (id) => {
    // navigate("/updateCommentaryFeature", { state: { commentaryId: id } });
    localStorage.setItem("updateCommentaryId", "" + id);
    const url = new URL(window.location.origin + "/updateCommentaryFeature");
    window.open(url.href, "_blank");
  };
  const handleStreamingListClick = (details) => {
    const url = new URL(window.location.origin + "/streamingList");
    sessionStorage.setItem("streamingListId", "" + details?.commentaryId);
    sessionStorage.setItem("streamingListDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("streamingListId");
    sessionStorage.removeItem("streamingListDetails");
  };
  const handleClone = async () => {
    if (cloneValues.name !== "" && cloneValues.refrenceId !== "") {
      setIsLoading(true);
      await axiosInstance
        .post(`/admin/commentary/clone`, {
          commentaryId: checekedList?.[0],
          ...cloneValues,
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
          setCloneModelVisible(false);
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
    } else {
      dispatch(
        updateToastData({
          data: "Name and Reference Id are required",
          title: "Required",
          type: ERROR,
        })
      );
    }
  };
  const handleChange = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeMatchType`, {
        ...selectedCommentary,
      })
      .then((response) => {
        fetchData();
        if (response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage =
            response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
        setChangeModelVisible(false);
      })
      .catch((error) => {
        setChangeModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handlePythonChange = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updatePythonAPI`, {
        ...selectedPythonCommentary,
      })
      .then((response) => {
        fetchData();
        if (response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage =
            response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
        setChangePythonModel(false);
      })
      .catch((error) => {
        setChangePythonModel(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleChangeRunner = async () => {
    setIsLoading(true);
    const payload = [
      selectedCommentaryRunner?.team1,
      selectedCommentaryRunner?.team2,
    ];
    await axiosInstance
      .post(`/admin/ImportMarket/updateTeamId`, payload)
      .then((response) => {
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setRunnerModelVisible(false);
      })
      .catch((error) => {
        setRunnerModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };
  const handleChangeResult = async (dataToSend) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeResult`, dataToSend)
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
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleChangeEventRef = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeEventRefId`, {
        ...selectedEventRef,
      })
      .then((response) => {
        fetchData();
        if (response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage =
            response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
        setEventRefModelVisible(false);
      })
      .catch((error) => {
        setEventRefModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleActiveInactive = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/activeInactiveCommentary`, {
        commentaryId: record?.commentaryId,
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

  const handleActiveInactiveTest = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeIsTest`, {
        commentaryId: record?.commentaryId,
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

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updateShowClient`, {
        commentaryId: record?.commentaryId,
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
  const handleIsCountInPoint = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/isCountInPoint`, {
        commentaryId: record?.commentaryId,
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
  const handleTeamPredictionPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updateTeamPrediction`, {
        commentaryId: record?.commentaryId,
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
    const newDateRange = {
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]}T23:59:00`,
    };

    setDateRange(newDateRange);
    setIsSearch(true)
    fetchData({
      ...value,
      startDate: convertDateLocalToUTC(newDateRange.startDate, "index"),
      endDate: convertDateLocalToUTC(newDateRange.endDate, "index"),
    });
    fetchEventTypeData();
  };

  const handleLoadSingleCommentaryData = async (commentaryId, password) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/loadPanelData`, {
        module: [MODULE_SINGLE_COMMENTARY],
        password,
        commentaryId,
      });

      // setLoadDataModelVisable(false); // This will be handled by the wrapper function
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openScorecardIframe = (record) => {
    if (record && loadInitData) {
      const baseUrl = loadInitData.find(
        (item) => item.key === loadInit.SCORECARD_FRAME_URL
      )?.value;
      if (baseUrl) {
        scorecardFrameUrl = baseUrl.replace("{commentaryId}", record?.commentaryId);
        window.open(scorecardFrameUrl, "_blank", "width=600,height=400");
        // console.log("url: ",scorecardFrameUrl);
      }
    }
  };

  const openVideoIframe = (details) => {
    if(details?.streamingUrl) {
      sessionStorage.setItem("streamingData", "" +  JSON.stringify(details));
      const baseUrl = window.location.origin;
      let iframeURL = `${baseUrl}/streamwatch`;
      window.open(iframeURL, "_blank", "width=600, height=400");
    }
  };

  const handleUpdateDay = async (updatedData) => {
    try {
      setIsLoading(true);
      const { data: response } = await axiosInstance.post(
        `/admin/commentary/updatePitchAndSession`,
        {
          commentaryId: updatedData.commentaryId,
          pitchAge: +updatedData.pitchAge,
          session: updatedData.session,
        }
      );

      fetchData();
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setIsLoading(false);
      setUpdateDayModelVisible(false);
    }
  };

  const handleLoadSingleCommentaryDataWithModal = async (password) => {
    if (selectedCommentaryId) {
      await handleLoadSingleCommentaryData(selectedCommentaryId, password);
      setLoadSingleDataModelVisible(false);
      setSelectedCommentaryId(null);
    }
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.commentaryId)
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

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
    setCheckedList([]);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCheckedList([]);
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
            checked={checekedList.includes(record.commentaryId)}
            onChange={() => {
              handleSingleCheck(record);
              if (!checekedList.includes(record.commentaryId)) {
                setCloneValues({
                  eventName: record?.eventName,
                  eventRefId: record?.eventRefId,
                });
              }
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleEdit(record.commentaryId);
          }}
        >
          <i className="bx bx-edit"></i>
        </span>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "",
      key: "viewScoreCard",
      printType: "ignore",
      render: (text, record) => (
        <Button
          color="primary"
          size="sm"
          className="btn viewScoreCard"
          onClick={() => openScorecardIframe(record)}
        >
          S
        </Button>
      ),
      style: { width: "4%", textAlign: "center" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocalWithoutSec24(text, "index")
            : convertDateUtcFormatWithoutSec24(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      sticky: true,
      style: { width: "10%", left: 0},
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <span style={{ cursor: record.isPredictMarket && "pointer" }}>
            {text}
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEventRefModelVisible(true);
              setSelectedEventRef(record);
            }}
          >
            {" "}
            <Tooltip
              title="Edit Event Id"
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              {<a className="bx bx-edit-alt"></a>}
            </Tooltip>
          </span>
        </div>
      ),
      key: "eventRefId",
      sort: true,
      sticky: true,
      style: { width: 100, left: 150 },
    },
    // {
    //   title: "Competition",
    //   dataIndex: "competition",
    //   key: "competition",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (
        <div className="d-flex flex-column">
          <span>{text}{record?.eventNo ? `(${record.eventNo})` : ""}</span>
          {/* <span className="point-font">{record?.eventNo}</span> */}
          <span style={{ fontSize: "12px"}}>{record.competition}</span>
        </div>
      ),
      key: "eventName",
      sort: true,
      sticky: true,
      style: { width: 100, left: 250 },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {record?.streamingUrl && (
          <Tooltip
            title="Watch TV"
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <i
              className="bx bxs-tv"
              role="button"
              onClick={() => openVideoIframe(record)}
              style={{ cursor: "pointer", fontSize: "18px" }}
            ></i>
          </Tooltip>
        )}
        <span
          onClick={() => {
            setChangeModelVisible(true);
            setSelectedCommentary(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text}{" "}
          <Tooltip
            title="Edit Match Type"
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            {<a className="bx bx-edit-alt"></a>}
          </Tooltip>
        </span>
        </div>
      ),
      key: "matchType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Scoring",
      key: "commentaryScoring",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Go to scoring"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"warning"}
            size="sm"
            className="btn"
            onClick={() => {
              handleDetailsClick(record.commentaryId);
            }}
          >
            <i class="bx bxs-right-arrow"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => <span>{mapCommentaryStatus(text)}</span>,
      key: "commentaryStatus",
      sort: true,
      style: { width: "40%" },
    },
    {
      title: "Day",
      dataIndex: "pitchAge",
      render: (text, record) => (
        <span
          onClick={() => {
            setUpdateDayModelVisible(true);
            setSelectedCommentaryDay(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text}{" "}
          <Tooltip
            title="Edit Day"
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <a className="bx bx-edit-alt"></a>
          </Tooltip>
        </span>
      ),
      key: "pitchAge",
      style: { width: "10%" },
    },
    {
      title: "Show",
      key: "isClientShow",
      render: (text, record) => (
        <Tooltip
          title={"Show/Hide Client"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isClientShow ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isClientShow", record, record?.isClientShow);
            }}
          >
            <i
              className={`bx ${record?.isClientShow ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Commentary"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleActiveInactive("isActive", record, record?.isActive);
            }}
          >
            <i
              className={`bx ${record?.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "Virtual",
    //   key: "isVirtual",
    //   render: (text, record) => (
    //     <Button
    //       color={`${record.isVirtual ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //       disabled
    //     >
    //       <i
    //         className={`bx ${record?.isVirtual ? "bx-check" : "bx-block"}`}
    //       ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Player",
      key: "updatePlayers",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Update Players"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"info"}
            size="sm"
            className="btn"
            onClick={() => {
              handleUpdatePlayersClick(record);
            }}
          >
            <i class="bx bxs-up-arrow-square"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "S-Update",
      key: "updateCommentary",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Update Commentary"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            // color={"success"}
            size="sm"
            className="btn updateCommentaryBtn"
            onClick={() => {
              handleUpdateCommentaryClick(record.commentaryId);
            }}
          >
            <i class="bx bx-arrow-to-right"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "SR",
      dataIndex: "setRunner",
      render: (text, record) => (
        <Tooltip
          title={"Set Runner"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            size="sm"
            className="btn runner-button-commentary"
            onClick={() => {
              setRunnerModelVisible(true);
              setSelectedCommentaryRunner(record);
            }}
            style={{ cursor: "pointer" }}
          >
            <i class="bx bxs-up-arrow-square"></i>
          </Button>
        </Tooltip>
      ),
      key: "setRunner",
      sort: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "DLS",
      dataIndex: "dls",
      render: (text, record) => (
        <Tooltip
          title={"Duckworth-Lewis-Stern"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            size="sm"
            className="dlsBtn btn"
            onClick={() => {
              setDlsModalCommentary(record);
            }}
          >
            <i class="bx bx-cloud-light-rain"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "10%" },
    },
    {
      title: "CID",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Created",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "G-Image",
      key: "generateImage",
      render: (text, record) => (
        <>
          <Tooltip
            title={"Generate Image"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"info"}
              size="sm"
              className="btn generateImageBtn"
              onClick={() => {
                setGenerateModalData(record);
                setIsGenerateModalOpen(true);
              }}
            >
              GI
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Logs",
      key: "commentaryLogs",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          <Tooltip
            title={"Commentary Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"primary"}
              size="sm"
              className="btn commentaryLogsBtn"
              onClick={() => {
                handleCommentaryLogsClick(record);
              }}
            >
              C
              {/* <i class="bx bxs-up-arrow-square"></i> */}
            </Button>
          </Tooltip>
          <Tooltip
            title={"Undo Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"warning"}
              size="sm"
              className="btn undoLogsBtn"
              onClick={() => {
                handleUndoLogsClick(record);
              }}
            >
              U
              {/* <i class="bx bxs-up-arrow-square"></i> */}
            </Button>
          </Tooltip>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "S-Score",
    //   key: "shortCommentary",
    //   printType: "ignore",
    //   render: (text, record) => (
    //     <Tooltip
    //       title={"Short Score"}
    //       color={"#e8e8ea"}
    //       overlayInnerStyle={{ color: "#000" }}
    //     >
    //       <Button
    //         color={"secondary"}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleShortCommentaryClick(record.commentaryId);
    //         }}
    //       >
    //         <i class="bx bxs-chevrons-right"></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "CP",
      key: "isCountInPoint",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Count In Point"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isCountInPoint ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleIsCountInPoint(
                "isCountInPoint",
                record,
                record?.isCountInPoint
              );
            }}
          >
            <i
              className={`bx ${
                record?.isCountInPoint ? "bx-check" : "bx-block"
              }`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "Win %",
    //   key: "isTeamPredictionOn",
    //   render: (text, record) => (
    //     <Tooltip
    //       title={"Active/Inactive Team Prediction"}
    //       color={"#e8e8ea"}
    //       overlayInnerStyle={{ color: "#000" }}
    //     >
    //       <Button
    //         color={`${record.isTeamPredictionOn ? "primary" : "danger"}`}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleTeamPredictionPermissions(
    //             "isTeamPredictionOn",
    //             record,
    //             record.isTeamPredictionOn
    //           );
    //         }}
    //       >
    //         <i
    //           className={`bx ${
    //             record.isTeamPredictionOn ? "bx-check" : "bx-block"
    //           }`}
    //         ></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Test",
      key: "isTest",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Test"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isTest ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleActiveInactiveTest("isTest", record, record?.isTest);
            }}
          >
            <i className={`bx ${record?.isTest ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Load Data",
      key: "loadSingleData",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title="Load Data"
          color="#e8e8ea"
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color="warning"
            size="sm"
            className="btn"
            onClick={() => {
              setSelectedCommentaryId(record.commentaryId); // Store the commentaryId
              setLoadSingleDataModelVisible(true); // Open the modal
            }}
          >
            <i className="bx bx-cloud-download"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "Algo",
    //   dataIndex: "pythonId",
    //   render: (text, record) => (
    //     <span
    //       onClick={() => {
    //         setChangePythonModel(true);
    //         setSelectedPythonCommentary(record);
    //       }}
    //       style={{ cursor: "pointer" }}
    //     >
    //       {record?.developerName}{" "}
    //       <Tooltip
    //         title="Edit Python Type"
    //         color={"#e8e8ea"}
    //         overlayInnerStyle={{ color: "#000" }}
    //       >
    //         {<a className="bx bx-edit-alt"></a>}
    //       </Tooltip>
    //     </span>
    //   ),
    //   key: "pythonId",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    // {
    //   title: "Algo",
    //   dataIndex: "pythonId",
    //   render: (text, record) => (
    //     <span
    //       onClick={() => {
    //         setChangePythonModel(true);
    //         setSelectedPythonCommentary(record);
    //       }}
    //       style={{ cursor: "pointer" }}
    //     >
    //       {record?.pythonURI}{" "}
    //       <Tooltip
    //         title="Edit Python Type"
    //         color={"#e8e8ea"}
    //         overlayInnerStyle={{ color: "#000" }}
    //       >
    //         {<a className="bx bx-edit-alt"></a>}
    //       </Tooltip>
    //     </span>
    //   ),
    //   key: "pythonId",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    
    {
      title: "Scoring Type",
      dataIndex: "scoringType",
      key: "scoringType",
      sort: true,
      render: (text, record) => (
        <div className="">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{ cursor: record.isPredictMarket && "pointer" }}
            // onClick={() => {
            //   if (record.isPredictMarket) {
            //     handleOddsViewClick(record.commentaryId);
            //   }
            // }}
          >
            {text == 1 ? "Manual" : text == 2 ? "Entity" : ""}
          </span>
        </div>
        <div>
          {record?.tpId}
        </div>
        </div>
      ),
      style: { width: "10%" },
    },
    {
      title: "",
      dataIndex: "streamingUrl",
      key: "streamingView",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Streaming View"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"info"}
            size="sm"
            className="btn"
            onClick={() => {
              handleStreamingListClick(record);
            }}
          >
            SV
            {/* <i class="bx bxs-up-arrow-square"></i> */}
          </Button>
        </Tooltip>
      ),
      style: { width: "4%", textAlign: "center" },
    },
  ];

  const getColumns = (data) => {
    const resultColumn = {
      title: "Change Result",
      dataIndex: "result",
      render: (text, record) => {
        if (record.commentaryStatus === 4 || record.commentaryStatus === 10) {
          return (
            <span
              onClick={() => {
                setResultModelVisible(true);
                setSelectedResult(record);
              }}
              style={{ cursor: "pointer" }}
            >
              {text} <i className="bx bx-edit-alt"></i>
            </span>
          );
        }
        return <span>{text}</span>; // fallback when condition is not met
      },
      key: "result",
      sort: true,
      style: { width: "10%" },
    };
    const AwardColumn = {
      title: "Award",
      key: "commentaryAward",
      printType: "ignore",
      render: (text, record) => {
        if (record.commentaryStatus === 4 || record.commentaryStatus === 10) {
          return (
            <Tooltip
              title="Awards"
              color="#e8e8ea"
              overlayInnerStyle={{ color: "#000" }}
            >
              <Button
                size="sm"
                className="award-button btn"
                onClick={() => setShowAwardModel(record.commentaryId)}
              >
                <i className="bx bxs-award"></i>
              </Button>
            </Tooltip>
          );
        }

        return null;
      }

      ,
      style: { width: "2%", textAlign: "center" },
    };
    const eventSnapColumn = {
      title: "Event Snap",
      dataIndex: "eventSnap",
      render: (text, record) => (
        <Tooltip
          title={"Event Snap"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"primary"}
            size="sm"
            className="btn"
            onClick={() => {
              handleCommentaryEventSnapClick(record);
            }}
          >
            <i class="bx bxs-up-arrow-square"></i>
          </Button>
        </Tooltip>
      ),
      key: "eventSnap",
      sort: true,
      style: { width: "2%", textAlign: "center" },
    };
    const updatedColumn = [...columns];

    if (data.some((record) => record?.commentaryStatus === 4 || record?.commentaryStatus === 10)) {
      updatedColumn.splice(7, 0, AwardColumn);
      updatedColumn.splice(8, 0, resultColumn);
    }

    if (data.some((record) => record?.commentaryStatus === 4)) {
      updatedColumn.splice(9, 0, eventSnapColumn);
    }
    return updatedColumn;
  };

  const updatedColumns = getColumns(data);
  //elements required
  const tableElement = {
    title: "Commentary List",
    headerSelect: false,
    eventTypeSelect: true,
    switch: false,
    clone: true,
    commentaryStatus: true,
    isVirtual: true,
    competitionsSelect: true,
    resetButton: true,
    reloadButton: true,
    isDateTypeSelect: true,
    statusOptions: [
      {
        label: "All",
        value: 0,
      },
      {
        label: "Open",
        value: 1,
      },
      {
        label: "Toss Done",
        value: 2,
      },
      {
        label: "In Progress",
        value: 3,
      },
      {
        label: "End",
        value: 4,
      },
      {
        label: "Innings Break",
        value: 5,
      },
    ],
    virtualOptions: [
      {
        label: "All",
        value: 0,
      },
      {
        label: "true",
        value: true,
      },
      {
        label: "false",
        value: false,
      },
    ],
    isDateRange: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, permissionObj]);

  useEffect(() => {
    fetchEventTypeData();
  }, []);

  useEffect(() => {
    if (!eventTypeId) {
      setCompetitions([]);
    }
  }, [eventTypeId]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary List" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={updatedColumns}
            dataSource={data}
            tableElement={tableElement}
            defaultCommentrayStatus={EventRefId && {
                label: "All",
                value: 0,
              }
            }
            closeModelFunction={setCloseModelVisible}
            cancelModelFunction={setCancelModelVisible}
            cloneModelFunction={setCloneModelVisible}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            onAddNavigate={"/addCommentary"}
            isCommentaryList="true"
            competitions={competitions}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            dateType={dateType}
            selectedTableElementsLogs={userRefData?.competitionId != 0 || userRefData?.eventTypeId != 0 ? filledDropdownData : selectedTableElements}
            setDateType={setDateType}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isClosePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_EDIT
            )}
            isCancelPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_EDIT
            )}
            setDateRange={setDateRange}
            dateRange={dateRange}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          <CloseTabModel
            closeModelVisible={closeModelVisible}
            setCloseModelVisable={setCloseModelVisible}
            handleClose={handleClose}
            singleCheck={checekedList}
          />
          <CancelTabModel
            cancelModelVisible={cancelModelVisible}
            setCancelModelVisible={setCancelModelVisible}
            handleCancel={handleCancel}
            singleCheck={checekedList}
          />
          <CommentaryClone
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneValues={setCloneValues}
            cloneValues={cloneValues}
            singleCheck={checekedList}
          />
          {changeModelVisible && (
            <ChnageMatchTypeModel
              changeModelVisible={changeModelVisible}
              setChangeModelVisible={setChangeModelVisible}
              handleChange={handleChange}
              setMatchType={setMatchType}
              singleCheck={checekedList}
              selectedCommentary={selectedCommentary}
              setSelectedCommentary={setSelectedCommentary}
            />
          )}
          {changePythonModel && (
            <ChangePythonType
              changeModelVisible={changePythonModel}
              setChangeModelVisible={setChangePythonModel}
              handleChange={handlePythonChange}
              singleCheck={checekedList}
              selectedCommentary={selectedPythonCommentary}
              setSelectedCommentary={setSelectedPythonCommentary}
            />
          )}
          {resultModelVisible && (
            <ChangeResultModel
              resultModelVisible={resultModelVisible}
              setResultModelVisible={setResultModelVisible}
              handleChange={handleChangeResult}
              selectedResult={selectedResult}
            />
          )}
          {eventRefModelVisible && (
            <ChangeEventRefIdModel
              eventRefModelVisible={eventRefModelVisible}
              setEventRefModelVisible={setEventRefModelVisible}
              handleChange={handleChangeEventRef}
              singleCheck={checekedList}
              selectedEventRef={selectedEventRef}
              setSelectedEventRef={setSelectedEventRef}
            />
          )}
          {runnerModelVisible && (
            <ChangeRunnerModel
              runnerModelVisible={runnerModelVisible}
              setRunnerModelVisible={setRunnerModelVisible}
              handleChange={handleChangeRunner}
              singleCheck={checekedList}
              selectedCommentaryRunner={selectedCommentaryRunner}
              setSelectedCommentaryRunner={setSelectedCommentaryRunner}
            />
          )}
          {loadSingleDataModelVisible && (
            <LoadDataModal
              loadDataModelVisable={loadSingleDataModelVisible}
              setLoadDataModelVisable={setLoadSingleDataModelVisible}
              handleLoadData={handleLoadSingleCommentaryDataWithModal}
              moduleName={"Single Commentary"}
            />
          )}
          {dlsModalCommentary && (
            <DlsModal
              commentaryDetails={dlsModalCommentary}
              toggle={() => {
                setDlsModalCommentary(false);
              }}
            />
          )}
          {showAwardModel && (
            <AwardSelectionComponent
              commentaryId={showAwardModel}
              onClose={() => {
                setShowAwardModel(undefined);
              }}
            />
          )}
          {isGenerateModalOpen && (
            <GenerateModal
              isOpen={isGenerateModalOpen}
              toggle={() => setIsGenerateModalOpen(!isGenerateModalOpen)}
              data={generateModalData}
              fetchData={fetchData}
            />
          )}
          {updateDayModelVisible && (
            <UpdateDayModel
              updateDayModelVisible={updateDayModelVisible}
              setUpdateDayModelVisible={setUpdateDayModelVisible}
              handleUpdateDay={handleUpdateDay}
              selectedCommentaryDay={selectedCommentaryDay}
              setSelectedCommentaryDay={setSelectedCommentaryDay}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
