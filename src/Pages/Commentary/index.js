import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { mapCommentaryStatus } from "./functions";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DeleteTabModel from "../../components/Model/DeleteModel";
import LoadCommentaryModel from "../../components/Model/LoadCommentaryModel";
import SuspendTabModel from "../../components/Model/SuspendModel";
import CloseTabModel from "../../components/Model/CloseModel";
import CancelTabModel from "../../components/Model/CancelModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { CommentaryClone } from "../../components/Model/Clone";
import { isEmpty, isEqual } from "lodash";
import {
  ERROR,
  MODULE_COMMENTARY,
  MODULE_SINGLE_COMMENTARY,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMMENTARY,
  WARNING,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateLocalToUTC,
  convertDateUTCToLocalWithoutSec,
  convertDateUtcFormatWithoutSec,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChnageMatchTypeModel } from "../../components/Model/ChangeMatchType";
import { UpdateDayModel } from "../../components/Model/UpdateDayModel";
import { ChangeDelayModel } from "../../components/Model/ChangeDelay";
import { ChangeResultModel } from "../../components/Model/ChangeResult";
import { ChangeEventRefIdModel } from "../../components/Model/ChangeEventRefId";
import { DlsModal } from "./CommentaryModels/DlsModal";
import "./CommentaryCss.css";
import { ChangeRunnerModel } from "../../components/Model/ChangeRunnerModel";
import { Tooltip } from "antd";
import AwardSelectionComponent from "./CommentaryModels/AwardModal";
import CommentaryMarketTemplateModel from "../../components/Model/CommentaryMarketTemplateModel";
import LoadDataModal from "../../components/Model/LoadDataModal";
import GenerateModal from "./GenerateModal";
import { loadInit } from "../../config";
import { ChangePythonType } from "../../components/Model/ChangePythonType";
import { ChangeCompititionModel } from "../../components/Model/ChangeCompititionModel";
import { ChangeScoringModel } from "../../components/Model/ChangeScoringModel";
import PredictMarketPasswordModal from "../../components/Model/PredictMarketPasswordModal";

const Index = () => {
  const pageName = TAB_COMMENTARY;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary";
  const [selectedTableElements, setSelectedTableElements] = useState({
      eventType: null,
      competition: null,
      scoringType: null,
      tpId: null
  });
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [resultModelVisible, setResultModelVisible] = useState(false);
  const [delayModelVisible, setDelayModelVisible] = useState(false);
  const [eventRefModelVisible, setEventRefModelVisible] = useState(false);
  const [compititionModelVisible, setCompititionModelVisible] = useState(false);
  const [scoringModelVisible, setScoringModelVisible] = useState(false);
  const [changePythonModel, setChangePythonModel] = useState(false);
  const [matchType, setMatchType] = useState("");
  const [selectedCommentary, setSelectedCommentary] = useState({});
  const [selectedPythonCommentary, setSelectedPythonCommentary] = useState({});
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedDelay, setSelectedDelay] = useState({});
  const [selectedEventRef, setSelectedEventRef] = useState({});
  const [selectedCompititon, setSelectedCompititon] = useState({});
  const [dlsModalCommentary, setDlsModalCommentary] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [userRefData, setUserRefData] = useState(false);
  const [filledDropdownData, setFilledDropdownData] = useState(false);
  const [cloneValues, setCloneValues] = useState({
    eventName: "",
    eventRefId: "",
  });
  const [isSearch, setIsSearch] = useState(true);
  const [dateType, setDateType] = useState({
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
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadModelVisable, setLoadModelVisable] = useState(false);
  const [loadSingleDataModelVisible, setLoadSingleDataModelVisible] =
    useState(false);
  const [predictPasswordModelVisible, setPredictPasswordModelVisible] =
    useState(false);
  const [predictRecord,setPredictRecord] = useState({})
  const [selectedCommentaryId, setSelectedCommentaryId] = useState(null);
  const [suspendModelVisable, setSuspendModelVisable] = useState(false);
  const [closeModelVisible, setCloseModelVisible] = useState(false);
  const [cancelModelVisible, setCancelModelVisible] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [runnerModelVisible, setRunnerModelVisible] = useState(false);
  const [selectedCommentaryRunner, setSelectedCommentaryRunner] = useState({});
  const [showAwardModel, setShowAwardModel] = useState(undefined);
  const [marketTemplateModelVisible, setMarketTemplateModelVisible] =
    useState(false);
  const [marketTemplateRecord, setMarketTemplateTimeRecord] = useState({});
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [generateModalData, setGenerateModalData] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [pythonApis, setpythonApis] = useState([]);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [updateDayModelVisible, setUpdateDayModelVisible] = useState(false);
  const [selectedCommentaryDay, setSelectedCommentaryDay] = useState({});

  let scorecardFrameUrl = null;

  const didInitialFetch = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tabelNoteDisplay = (
    <>
      <b>
        <i>Note :</i>
      </b>
      {/* <div>Click on Event Id to open <b>Odds View</b> page  </div> */}
      <div>
        Click on Event Name to open <b>Open Market</b> page{" "}
      </div>
    </>
  );

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      eventTypeId:
        latestValueFromTable?.eventTypeId || tableActions?.eventTypeId || 0,
      // competitionId: latestValueFromTable?.eventTypeId !== eventTypeId ? 0 : latestValueFromTable?.competitionId || 0,
      competitionId:
        latestValueFromTable?.eventTypeId == eventTypeId
          ? latestValueFromTable?.competitionId
          : tableActions?.eventTypeId == eventTypeId
          ? tableActions?.competitionId
          : 0,
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
        startDate: convertDateLocalToUTC(latestValueFromTable ? latestValueFromTable?.startDate : dateRange?.startDate , "index"),
        endDate: convertDateLocalToUTC(latestValueFromTable ? latestValueFromTable?.endDate : dateRange?.endDate, "index"),
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
    if (latestValueFromTable?.eventTypeId || userRefData.eventTypeId) {
      const valueToFetchFrom =
        userRefData.eventTypeId && +userRefData.eventTypeId !== 0
          ? userRefData.eventTypeId
          : latestValueFromTable?.eventTypeId;
      fetchCompetitionData(valueToFetchFrom);
    }
  };
  const fetchUserPermission = () => {
    const refData = JSON.parse(localStorage.getItem("refData"));
    setUserRefData(refData);
    fetchData(refData);
  };
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/commentary/eventTypeList`, { isActive: true })
      .then((response) => {
        setEventTypes(response.result);
      })
      .catch((error) => {});
  };
  const fetchPythonAPIData = async () => {
    await axiosInstance
      .post(`/admin/commentary/pythonAPIs`, {})
      .then((response) => {
        setpythonApis(response.result);
      })
      .catch((error) => { });
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
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/delete`, {
        commentaryId: checekedList,
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
  const handleLoadCommentary = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/loadMultiCommentary`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setLoadModelVisable(false);
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
  const handleSuspend = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/suspendMarketByCId`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setSuspendModelVisable(false);
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
    localStorage.setItem("commentaryMasterId", "" + id);
    localStorage.setItem("commentary", "commentary");
    const url = new URL(window.location.origin + "/commentaryMaster");
    window.open(url.href, "_blank");
  };
  // const handleScorerDetailsClick = (id) => {
  //   // navigate("/commentaryMaster", { state: { commentaryId: id } });
  //   localStorage.setItem('commentaryScorerId', "" + id);
  //   localStorage.setItem('commentaryScorer', "commentary");
  //   const url = new URL(window.location.origin + "/commentaryScorer");
  //   window.open(url.href, '_blank');
  // };
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
  const handleScoringLogsClick = (details) => {
    const url = new URL(window.location.origin + "/scoringLogs");
    sessionStorage.setItem("scoringLogsId", "" + details?.commentaryId);
    sessionStorage.setItem("scoringLogsDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("scoringLogsId");
    sessionStorage.removeItem("scoringLogsDetails");
  };
  const handlePredictorDetailsClick = (details) => {
    const url = new URL(window.location.origin + "/predictorLogs");
    sessionStorage.setItem("predictorLogsId", "" + details?.commentaryId);
    sessionStorage.setItem(
      "predictorLogsDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("predictorLogsId");
    sessionStorage.removeItem("predictorLogsDetails");
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
  const handleSessionResultClick = (details) => {
    const url = new URL(window.location.origin + "/setSessionResult");
    sessionStorage.setItem("sessionResultId", "" + details?.commentaryId);
    sessionStorage.setItem(
      "sessionResultDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("sessionResultId");
    sessionStorage.removeItem("sessionResultDetails");
  };
  const handleCloseMarketClick = (details) => {
    const url = new URL(window.location.origin + "/unsettledMarket");
    sessionStorage.setItem("closeMarketId", "" + details?.commentaryId);
    sessionStorage.setItem("closeMarketDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("closeMarketId");
    sessionStorage.removeItem("closeMarketDetails");
  };
  const handleMarketResultClick = (details) => {
    const url = new URL(window.location.origin + "/setMarketResult");
    sessionStorage.setItem("marketResultId", "" + details?.commentaryId);
    sessionStorage.setItem("marketResultDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("marketResultId");
    sessionStorage.removeItem("marketResultDetails");
  };
  const handleUndoLogsClick = (details) => {
    const url = new URL(window.location.origin + "/undoLogs");
    sessionStorage.setItem("undoLogsId", "" + details?.commentaryId);
    sessionStorage.setItem("undoLogsDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("undoLogsId");
    sessionStorage.removeItem("undoLogsDetails");
  };
  const handleEventMarketLogsClick = (details) => {
    const url = new URL(window.location.origin + "/EventMarketLogs");
    sessionStorage.setItem("eventMarketLogsId", "" + details?.commentaryId);
    sessionStorage.setItem(
      "eventMarketLogsDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("eventMarketLogsId");
    sessionStorage.removeItem("eventMarketLogsDetails");
  };
  const handleCommentaryMarketRunnerClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryMarketRunner");
    sessionStorage.setItem(
      "marketRunnerCommentaryId",
      "" + details?.commentaryId
    );
    sessionStorage.setItem(
      "marketRunnerCommentaryDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
  };
  const handleEventMarketClick = (details) => {
    const url = new URL(window.location.origin + "/eventMarkets");
    sessionStorage.setItem(
      "commentaryEventMarketId",
      "" + details?.commentaryId
    );
    sessionStorage.setItem(
      "commentaryEventMarketDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryEventMarketId");
    sessionStorage.removeItem("commentaryEventMarketDetails");
  };
  const handleManualOddsMarketClick = (details) => {
    const url = new URL(window.location.origin + "/manualOddsMarkets");
    sessionStorage.setItem(
      "commentaryManualOddsMarketId",
      "" + details?.commentaryId
    );
    sessionStorage.setItem(
      "commentaryManualOddsMarketDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryManualOddsMarketId");
    sessionStorage.removeItem("commentaryManualOddsMarketDetails");
  };
  const handleCommentaryMarketTemplateClick = (id) => {
    // navigate("/commentaryMarketTemplate", { state: { commentaryId: id } });
    localStorage.setItem("marketTemplateCommentaryId", "" + id);
    const url = new URL(window.location.origin + "/commentaryMarketTemplate");
    window.open(url.href, "_blank");
  };
  const handleCommentaryMarketTemplateClickV1 = (details) => {
    // navigate("/commentaryMarketTemplate", { state: { commentaryId: id } });
    const url = new URL(window.location.origin + "/commentaryMarkets");
    sessionStorage.setItem(
      "marketTemplateCommentaryId",
      "" + details?.commentaryId
    );
    sessionStorage.setItem(
      "marketTemplateCommentaryDetails",
      "" + JSON.stringify(details)
    );
    window.open(url.href, "_blank");
  };
  const handleCommentaryEventSnapClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryEventSnap");
    sessionStorage.setItem("eventSnapId", "" + details?.commentaryId);
    sessionStorage.setItem("eventSnapDetails", "" + JSON.stringify(details));
    sessionStorage.setItem("eventSnapCommentaryHistory", true);
    window.open(url.href, "_blank");
  };
  const handleMarketEventActionClick = (id) => {
    localStorage.setItem("openMarketCommentaryId", "" + id);
    const url = new URL(window.location.origin + "/openMarket");
    // url.searchParams.append("commentaryId", id);
    window.open(url.href, "_blank");
  };
  const handleOddsViewClick = (id) => {
    localStorage.setItem("oddsViewCommentaryId", "" + id);
    const url = new URL(window.location.origin + "/oddsView");
    // url.searchParams.append("commentaryId", id);
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
  const handleUpdateManualOddsClick = (details) => {
    // navigate("/updateCommentaryFeature", { state: { commentaryId: id } });
    // localStorage.setItem(
    //   "updateManualOddsCommentaryId",
    //   "" + details?.commentaryId
    // );
    // localStorage.setItem(
    //   "updateManualOddsCommentaryDetails",
    //   "" + JSON.stringify(details)
    // );

    sessionStorage.setItem(
      "updateManualOddsCommentaryId",
      "" + details?.commentaryId
    );
    sessionStorage.setItem(
      "updateManualOddsCommentaryDetails",
      "" + JSON.stringify(details)
    );
    const url = new URL(window.location.origin + "/manualOddsMarket");
    window.open(url.href, "_blank");
  };
  const handleTraderClick = (details) => {
      const url = new URL(window.location.origin + "/dataproviderMarkets");
      sessionStorage.setItem('dataproviderEventId', "" + details?.eventRefId);
      sessionStorage.setItem('dataproviderEventDetails', "" + JSON.stringify(details));
      window.open(url.href, '_blank');
      sessionStorage.removeItem("dataproviderEventId");
      sessionStorage.removeItem("dataproviderEventDetails");
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
        setIsLoading(false);
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
        setIsLoading(false);
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
        setIsLoading(false);
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
        setIsLoading(false);
      });
  };
  const handleChangeDelay = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeDelay`, {
        ...selectedDelay,
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
        setDelayModelVisible(false);
      })
      .catch((error) => {
        setDelayModelVisible(false);
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
        setIsLoading(false);
      });
  };
  const handleChangeScoring = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/scoringType`, {
        "scoringType": selectedTableElements?.scoringType?.value ? selectedTableElements?.scoringType?.value : null,
        // "competitionId": selectedTableElements?.competition?.value,
        "commentaryId": selectedCompititon?.commentaryId,
        "tpId" : selectedTableElements?.scoringType?.value == 2 ? selectedTableElements?.tpId : null
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
        setScoringModelVisible(false);
      })
      .catch((error) => {
        setScoringModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  }
  const handleChangeCompitition = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeIds`, {
        "eventTypeId": selectedTableElements?.eventType?.value,
        "competitionId": selectedTableElements?.competition?.value,
        "commentaryId": selectedCompititon?.commentaryId
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
        setCompititionModelVisible(false);
      })
      .catch((error) => {
        setCompititionModelVisible(false);
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

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_COMMENTARY], password })
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
  const updatePredictMarket = async (pType, record, cState) => {
    await axiosInstance
      .post(`/admin/commentary/changePredictMarket`, {
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
    fetchPythonAPIData();
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
  const handlePredictMarketPassword = async ( password) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/admin/commentary/validatePass`, {
        password,
      });

      // setLoadDataModelVisable(false); // This will be handled by the wrapper function
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
      return response
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
      return error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSingleCommentaryDataWithModal = async (password) => {
    if (selectedCommentaryId) {
      await handleLoadSingleCommentaryData(selectedCommentaryId, password);
      setLoadSingleDataModelVisible(false);
      setSelectedCommentaryId(null);
    }
  };
  const handlePredictMarketPasswordModal = async (password) => {
    // if (selectedCommentaryId) {
      const response  = await handlePredictMarketPassword(password);

      if(response.success === true){
        updatePredictMarket(
          "isPredictMarket",
          predictRecord,
          predictRecord?.isPredictMarket
        );
        setPredictPasswordModelVisible(false)
      }
    //   setLoadSingleDataModelVisible(false);
    //   setSelectedCommentaryId(null);
    // }
  };

  const openScorecardIframe = (record) => {
    if (record && loadInitData) {
    const baseUrl = loadInitData.find(
      (item) => item.key === loadInit.SCORECARD_FRAME_URL
    )?.value;
      if (baseUrl) {
        scorecardFrameUrl = baseUrl.replace(
          "{commentaryId}",
          record?.commentaryId
        );
        window.open(scorecardFrameUrl, "_blank", "width=600,height=400");
        // console.log("url: ",scorecardFrameUrl);
      }
    }
  };

  const handleUpdateDay = async (updatedData) => {
    try {
      setIsLoading(true);
      const { data: response } = await axiosInstance.post(`/admin/commentary/updatePitchAndSession`, {
        commentaryId: updatedData.commentaryId,
        pitchAge: +updatedData.pitchAge,
        session: updatedData.session,
      });

      fetchData();
      dispatch(updateToastData({
        data: response?.message,
        title: response?.title,
        type: SUCCESS,
      }));
    } catch (error) {
      dispatch(updateToastData({
        data: error?.message,
        title: error?.title,
        type: ERROR,
      }));
    } finally {
      setIsLoading(false);
      setUpdateDayModelVisible(false);
    }
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
          // style={{ backgroundColor: "#51d9e1", color: "#fff", border: "#51d9e1" }}
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
            ? convertDateUTCToLocalWithoutSec(text, "index")
            : convertDateUtcFormatWithoutSec(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      sticky: true,
      style: { width: "10%", left: 0 },
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      // render: (text, record) => (
      //   <div className="d-flex align-items-center gap-1">
      //   <span
      //     style={{ cursor: record.isPredictMarket && "pointer" }}
      //     onClick={() => {
      //       if (record.isPredictMarket) {
      //         handleOddsViewClick(record.commentaryId);
      //       }
      //     }}
      //   >
      //     {text}
      //   </span>
      //   <a
      //   className="bx bx-edit-alt"
      //   style={{ cursor: "pointer" }}
      //   onClick={() => {
      //     setEventRefModelVisible(true);
      //     setSelectedEventRef(record);
      //   }}
      //   ></a>
      //   </div>
      // ),
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <span
            style={{ cursor: record.isPredictMarket && "pointer" }}
            // onClick={() => {
            //   if (record.isPredictMarket) {
            //     handleOddsViewClick(record.commentaryId);
            //   }
            // }}
          >
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
      style: { width: "10%", left: 150 },
    },
    // {
    //   title: "Competition",
    //   dataIndex: "competition",
    //   key: "competition",
    //   sort: true,
    //   render: (text, record) => (
    //     <div className="d-flex align-items-center gap-1">
    //       <span
    //         style={{ cursor: record.isPredictMarket && "pointer" }}
    //         // onClick={() => {
    //         //   if (record.isPredictMarket) {
    //         //     handleOddsViewClick(record.commentaryId);
    //         //   }
    //         // }}
    //       >
    //         {text}
    //       </span>
    //       <span
    //         style={{ cursor: "pointer" }}
    //         onClick={() => {
    //           setCompititionModelVisible(true);
    //           setSelectedCompititon(record);
    //         }}
    //       >
    //         {" "}
    //         <Tooltip
    //           title="Edit Competition"
    //           color={"#e8e8ea"}
    //           overlayInnerStyle={{ color: "#000" }}
    //         >
    //           {<a className="bx bx-edit-alt"></a>}
    //         </Tooltip>
    //       </span>
    //     </div>
    //   ),
    //   style: { width: "10%" },
    // },
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (
        <div className="d-flex flex-column">
          <span
            style={{ cursor: record.isPredictMarket && "pointer" }}
            onClick={() => {
              if (record.isPredictMarket) {
                handleMarketEventActionClick(record.commentaryId);
              }
            }}
          >
            {text}{record?.eventNo ? `(${record.eventNo})` : ""}
          </span>
          {/* <span className="point-font">{record?.eventNo}</span> */}
          <span style={{ fontSize: "12px", cursor: "pointer" }}>
            {record.competition}
            <Tooltip
              title="Edit Competition"
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <a
                className="bx bx-edit-alt"
                style={{ marginLeft: 5 }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the upper click
                  setCompititionModelVisible(true);
                  setSelectedCompititon(record);
                }}
              ></a>
            </Tooltip>
          </span>
        </div>
      ),
      key: "eventName",
      sort: true,
      sticky: true,
      style: { width: "10%", left: 300},
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      render: (text, record) => (
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
    // {
    //   title: "Scorer",
    //   key: "commentaryScorer",
    //   printType: "ignore",
    //   render: (text, record) => (
    //     <Tooltip title={"Go to Scorer"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //       <Button
    //         color={"info"}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleScorerDetailsClick(record.commentaryId);
    //         }}
    //       >
    //         <i class='bx bxs-right-arrow' ></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
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
          title={"Commentary"}
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
    // {
    //   title: "Team",
    //   dataIndex: "team1Name",
    //   key: "team1Name",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    // {
    //   title: "Competitor",
    //   dataIndex: "team2Name",
    //   key: "team2Name",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    {
      title: "Predict",
      key: "isPredictMarket",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          <Tooltip
            title={"Predict Market"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={`${record.isPredictMarket ? "primary" : "danger"}`}
              size="sm"
              className="btn"
              onClick={() => {
                if (record?.isPredictMarket) {
                  setPredictPasswordModelVisible(true);
                  setPredictRecord(record)
                }else{
                  updatePredictMarket(
                    "isPredictMarket",
                    record,
                    record?.isPredictMarket
                  );
                }
              }}
            >
              <i
                className={`bx ${
                  record?.isPredictMarket ? "bx-check" : "bx-block"
                }`}
              ></i>
            </Button>
          </Tooltip>
          <>
            {record.isPredictMarket && (
              <Tooltip
                title={"Add Market Template"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  color={"success"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    setMarketTemplateModelVisible(true);
                    setMarketTemplateTimeRecord(record);
                  }}
                >
                  <i className="bx bx-plus"></i>
                </Button>
              </Tooltip>
            )}
            {/* {record.isPredictMarket &&
              <Tooltip title={"Market Template"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                <Button
                  color={"primary"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    handleCommentaryMarketTemplateClick(record.commentaryId);
                  }}
                >
                  <i class='bx bxs-store' ></i>
                </Button>
              </Tooltip>} */}
            {record.isPredictMarket && (
              <Tooltip
                title={"Create Market Template"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  // color={"primary"}
                  size="sm"
                  className="btn createMarketTemplateBtn"
                  // style={{ backgroundColor: "#4676ff", color: "#fff", border: "#4676ff" }}
                  onClick={() => {
                    handleCommentaryMarketTemplateClickV1(record);
                  }}
                >
                  <i class="bx bxs-store"></i>
                  {/* <i class='bx bxs-bookmarks'></i> */}
                </Button>
              </Tooltip>
            )}
            {/* <Tooltip title={"Predictor Api Logs"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
              <Button
                color={"primary"}
                size="sm"
                className="btn"
                onClick={() => {
                  handlePredictorDetailsClick(record.commentaryId);
                }}
              >
                <i class='bx bxs-up-arrow-square' ></i>
              </Button>
            </Tooltip> */}
            {record.isPredictMarket && (
              <Tooltip
                title={"Predictor Api Logs"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  // color={"primary"}
                  size="sm"
                  // style={{ backgroundColor: "#01ccc3", color: "#fff", border: "#01ccc3" }}
                  className="btn predictorApiLogsBtn"
                  onClick={() => {
                    handlePredictorDetailsClick(record);
                  }}
                >
                  <i class="bx bxs-up-arrow-square"></i>
                </Button>
              </Tooltip>
            )}

            {/* {record.isPredictMarket && (
              <Tooltip
                title={"Manual Odds"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  color={"success"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    handleUpdateManualOddsClick(record);
                  }}
                >
                  <i class="bx bx-arrow-to-right"></i>
                </Button>
              </Tooltip>
            )} */}
          </>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "P-Market",
    //   key: "marketTemplate",
    //   printType: "ignore",
    //   render: (text, record) => (
    //     <Button
    //       color={"primary"}
    //       size="sm"
    //       disabled={
    //         !record.isPredictMarket || parseInt(record.commentaryStatus) !== 1
    //       }
    //       className="btn"
    //       onClick={() => {
    //         handleCommentaryMarketTemplateClick(record.commentaryId);
    //       }}
    //     >
    //       <i class='bx bxs-store' ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Markets",
      key: "marketResult",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          {record.isPredictMarket && (
            <>
              {record.isPredictMarket && (
                <Tooltip
                  title={"Event Market"}
                  color={"#e8e8ea"}
                  overlayInnerStyle={{ color: "#000" }}
                >
                  <Button
                    // color={"danger"}
                    // style={{ backgroundColor: "#f579e0", color: "#fff", border: "#f579e0" }}
                    size="sm"
                    className="bstn eventMarketBtn"
                    onClick={() => {
                      handleEventMarketClick(record);
                    }}
                  >
                    <i class="bx bxs-up-arrow-square"></i>
                  </Button>
                </Tooltip>
              )}
              {record.isPredictMarket && (
                <Tooltip
                  title={"Manual Odds Market"}
                  color={"#e8e8ea"}
                  overlayInnerStyle={{ color: "#000" }}
                >
                  <Button
                    color={"danger"}
                    size="sm"
                    // className="bstn"
                    className="dls-button btn"
                    onClick={() => {
                      handleManualOddsMarketClick(record);
                    }}
                  >
                    {/* <i class="bx bxs-up-arrow-square"></i> */}
                    B
                  </Button>
                </Tooltip>
              )}
              <Tooltip
                title={"Session Result"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  color={"primary"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    handleSessionResultClick(record);
                  }}
                >
                  S
                </Button>
              </Tooltip>

              <Tooltip
                title={"Market Result"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  color={"info"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    handleMarketResultClick(record);
                  }}
                >
                  M
                </Button>
              </Tooltip>

              <Tooltip
                title={"Close Market"}
                color={"#e8e8ea"}
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  color={"danger"}
                  size="sm"
                  className="btn"
                  onClick={() => {
                    handleCloseMarketClick(record);
                  }}
                >
                  C
                </Button>
              </Tooltip>
              <Tooltip
                title="Trader"
                color={"#e8e8ea"}
                // color="#f1734f"
                overlayInnerStyle={{ color: "#000" }}
              >
                <Button
                  // color="f1734f"
                  // style={{ backgroundColor: "#f1734f", color: "#fff", border: "#f1734f" }}
                  size="sm"
                  className="btn traderBtn"
                  onClick={() => {
                    handleTraderClick(record)
                    // setSelectedCommentaryId(record.commentaryId); // Store the commentaryId
                    // setLoadSingleDataModelVisible(true); // Open the modal
                  }}
                >
                  T
                </Button>
              </Tooltip>
            </>
          )}
        </div>
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
            // style={{ backgroundColor: "#0055a9", color: "#fff", border: "#0055a9" }}
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
            // style={{ backgroundColor: "#f759bb", color: "#fff", border: "#f759bb" }}
            className="btn dlsBtn"
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
      title: "Delay",
      dataIndex: "delay",
      render: (text, record) => (
        <span
          onClick={() => {
            setDelayModelVisible(true);
            setSelectedDelay(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text}{" "}
          <Tooltip
            title="Edit Delay"
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            {<a className="bx bx-edit-alt"></a>}
          </Tooltip>
        </span>
      ),
      key: "delay",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Algo",
      dataIndex: "pythonId",
      render: (text, record) => (
        <span
          onClick={() => {
            setChangePythonModel(true);
            setSelectedPythonCommentary(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {record?.developerName}{" "}
          <Tooltip
            title="Edit Python Type"
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            {<a className="bx bx-edit-alt"></a>}
          </Tooltip>
          <br />
          {record?.pythonURI}
        </span>
      ),
      key: "pythonId",
      sort: true,
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
              // style={{ backgroundColor: "#ad0947", color: "#fff", border: "#ad0947" }}
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
            title={"Scoring Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"info"}
              // style={{ backgroundColor: "#8ec8b7", color: "#fff", border: "#8ec8b7" }}
              size="sm"
              className="btn scoringLogsBtn"
              onClick={() => {
                handleScoringLogsClick(record);
              }}
            >
              S
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
              // style={{ backgroundColor: "#c88e8e", color: "#fff", border: "#c88e8e" }}
              size="sm"
              className="btn undoLogsBtn"
              onClick={() => {
                handleUndoLogsClick(record);
              }}
            >U
              {/* <i class="bx bxs-up-arrow-square"></i> */}
            </Button>
          </Tooltip>
          <Tooltip
            title={"EventMarket Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"info"}
              // style={{ backgroundColor: "#8e9dc8", color: "#fff", border: "#8e9dc8" }}
              size="sm"
              className="btn eventMarketLogsBtn"
              onClick={() => {
                handleEventMarketLogsClick(record);
              }}
            >
              E
              {/* <i class="bx bxs-up-arrow-square"></i> */}
            </Button>
          </Tooltip>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Rates",
      key: "marketRunner",
      render: (text, record) => (
        <Tooltip
          title={"Market Runner"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            // color={"warning"}
            // style={{ backgroundColor: "#512cb2", color: "#fff", border: "#512cb2" }}
            size="sm"
            className="btn marketRunnerBtn"
            onClick={() => {
              handleCommentaryMarketRunnerClick(record);
            }}
          >
            <i class="bx bxs-store"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "S-Score",
      key: "shortCommentary",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Short Score"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"secondary"}
            size="sm"
            // style={{ backgroundColor: "#0055a9", color: "#fff", border: "#0055a9" }}
            className="btn"
            onClick={() => {
              handleShortCommentaryClick(record.commentaryId);
            }}
          >
            <i class="bx bxs-chevrons-right"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "M-Odds",
    //   key: "commentaryMOdds",
    //   printType: "ignore",
    //   render: (text, record) => (
    //     <Tooltip title={"Manual Odds"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //       <Button
    //         color={"success"}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleUpdateManualOddsClick(record);
    //         }}
    //       >
    //         <i class='bx bx-arrow-to-right' ></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
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
      title: "CP",
      key: "isCountInPoint",
      render: (text, record) => (
        <Tooltip
          title={"Count In Point"}
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
    {
      title: "Win %",
      key: "isTeamPredictionOn",
      render: (text, record) => (
        <Tooltip
          title={"Team Prediction"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isTeamPredictionOn ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleTeamPredictionPermissions(
                "isTeamPredictionOn",
                record,
                record.isTeamPredictionOn
              );
            }}
          >
            <i
              className={`bx ${
                record.isTeamPredictionOn ? "bx-check" : "bx-block"
              }`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Test",
      key: "isTest",
      render: (text, record) => (
        <Tooltip
          title={"Test"}
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
      title: "Virtual",
      key: "isVirtual",
      render: (text, record) => (
        <Button
          color={`${record.isVirtual ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i
            className={`bx ${record?.isVirtual ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
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
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setScoringModelVisible(true);
              setSelectedCompititon(record);
            }}
          >
            {" "}
            <Tooltip
              title="Edit Scoring type"
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              {<a className="bx bx-edit-alt"></a>}
            </Tooltip>
          </span>
        </div>
        <div>
          {record?.tpId}
        </div>
        </div>
      ),
      style: { width: "10%"},
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
              {text} <a className="bx bx-edit-alt"></a>
            </span>
          );
        }

        return null; // or return text if you want to still show plain text
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
      },
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
    title: "Commentary",
    headerSelect: false,
    eventTypeSelect: true,
    switch: false,
    clone: true,
    loadCommentary: true,
    suspend: true,
    commentaryStatus: true,
    isVirtual: true,
    competitionsSelect: true,
    resetButton: true,
    reloadButton: true,
    loadData: true,
    isDateTypeSelect: true,
    pythonApiSelect: true,
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
      {
        label: "Cancel",
        value: 10,
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
    compToRender: tabelNoteDisplay,
    // isDataprovider: true
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, permissionObj]);

  useEffect(() => {
    fetchEventTypeData();
    fetchUserPermission();
    fetchPythonAPIData();
  }, []);

  useEffect(() => {
    if (!eventTypeId) {
      setCompetitions([]);
    }
  }, [eventTypeId]);

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

  const handleReload = (value) => {
    fetchData();
    fetchEventTypeData();
    fetchPythonAPIData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={updatedColumns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            loadModelFunction={setLoadModelVisable}
            suspendModelFunction={setSuspendModelVisable}
            closeModelFunction={setCloseModelVisible}
            cancelModelFunction={setCancelModelVisible}
            cloneModelFunction={setCloneModelVisible}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            openDataProvider={() => {
              navigate("/dataprovider");
            }}
            onAddNavigate={"/addCommentary"}
            competitions={competitions}
            pythonApis={pythonApis}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            dateType={dateType}
            setDateType={setDateType}
            selectedTableElementsLogs={filledDropdownData}
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
            isSuspendPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_EDIT
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
          />
          <SuspendTabModel
            suspendModelVisible={suspendModelVisable}
            setSuspendModelVisable={setSuspendModelVisable}
            handleSuspend={handleSuspend}
            singleCheck={checekedList}
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
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <LoadCommentaryModel
            loadModelVisable={loadModelVisable}
            setLoadModelVisable={setLoadModelVisable}
            handleLoad={handleLoadCommentary}
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
          {delayModelVisible && (
            <ChangeDelayModel
              delayModelVisible={delayModelVisible}
              setDelayModelVisible={setDelayModelVisible}
              handleChange={handleChangeDelay}
              singleCheck={checekedList}
              selectedDelay={selectedDelay}
              setSelectedDelay={setSelectedDelay}
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
          {compititionModelVisible && (
            <ChangeCompititionModel
              compititonModelVisible={compititionModelVisible}
              setCompititonModelVisible={setCompititionModelVisible}
              handleChange={handleChangeCompitition}
              singleCheck={checekedList}
              selectedCompititon={selectedCompititon}
              setSelectedCompititon={setSelectedCompititon}
              setSelectedTableElements={setSelectedTableElements}
              selectedTableElements={selectedTableElements}
            />
          )}
          {scoringModelVisible && (
            <ChangeScoringModel
              scoringModelVisible={scoringModelVisible}
              setScoringModelVisible={setScoringModelVisible}
              handleChange={handleChangeScoring}
              singleCheck={checekedList}
              selectedCompititon={selectedCompititon}
              setSelectedCompititon={setSelectedCompititon}
              setSelectedTableElements={setSelectedTableElements}
              selectedTableElements={selectedTableElements}
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
          {marketTemplateModelVisible && (
            <CommentaryMarketTemplateModel
              marketTemplateModelVisible={marketTemplateModelVisible}
              setMarketTemplateModelVisible={setMarketTemplateModelVisible}
              marketTemplateRecord={marketTemplateRecord}
              fetchData={fetchData}
            />
          )}
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Commentary"}
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
          {predictPasswordModelVisible && (
            <PredictMarketPasswordModal
              predictMarketPasswordModalVisable={predictPasswordModelVisible}
              setPredictMarketPasswordModalVisable={setPredictPasswordModelVisible}
              handleLoadData={handlePredictMarketPasswordModal}
              // moduleName={"Single Commentary"}
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
          {/* Scorecard Modal */}
          {/* {isScorecardShow &&
            activeScorecardCommentary &&
            scorecardFrameUrl && (
              <Modal
                isOpen={isScorecardShow}
                toggle={() => {
                  setIsScorecardShow(false);
                  setActiveScorecardCommentary(null);
                }}
                size="xl"
                style={{ maxWidth: "90vw" }}
              >
                <ModalHeader
                  toggle={() => {
                    setIsScorecardShow(false);
                    setActiveScorecardCommentary(null);
                  }}
                >
                  Scorecard for: {activeScorecardCommentary.eventName} (ID:{" "}
                  {activeScorecardCommentary.eventRefId})
                </ModalHeader>
                <ModalBody className="p-0">
                  <iframe
                    title="Scorecard viewer"
                    width="100%"
                    height="600"
                    src={scorecardFrameUrl}
                    frameBorder="0"
                    style={{ border: "none" }}
                  />
                </ModalBody>
              </Modal>
            )} */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
