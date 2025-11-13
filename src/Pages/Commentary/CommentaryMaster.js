import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  BET_ALLOW,
  COMMENTARY_MAIN_SCREEN,
  COMMENTARY_PLAYER_SELECTION_SCREEN,
  COMMENTARY_TOSS_SCREEN,
  COMMENTARY_UPDATE,
  ERROR,
  PERMISSION_ADD,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEXT,
  SUCCESS,
  TAB_COMMENTARY,
  TAB_COMMENTARY_LIST,
  WARNING,
} from "../../components/Common/Const";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Toss from "./Toss";
import PlayerSelection from "./PlayerSelection";
import {
  addCommentaryScreenData,
  loadCommentaryFeature,
  updateCommentaryBallStatus,
  updateCommentaryDisplayStatus,
  updateSavedState,
} from "../../Features/Tabs/commentarySlice";
import Commentary from "./Commentary";
import "./CommentaryCss.css";
import ChangeStatusModal from "./CommentaryModels/ChangeStatusModal";
import NetworkStatus from "../../components/Common/Reusables/NetworkStatus";
import { isEmpty } from "lodash";
import Switch from "react-switch";
import createSocket from "../../Features/socket";
import logoDark from "../../assets/images/logo-dark.png";
import TossScreen from "./CommentryRightControls/TossScreen";
import PlayerSelectionScreen from "./CommentryRightControls/PlayerSelectionScreen";
import { loadInit } from "../../config";
import { BALL_START_STATUS, BOWLER_CHANGE_DISPLAY_STATUS } from "./CommentartConst";

const ALL_SCREENS = {
  1: COMMENTARY_TOSS_SCREEN,
  2: COMMENTARY_PLAYER_SELECTION_SCREEN,
  3: COMMENTARY_MAIN_SCREEN,
  4: COMMENTARY_MAIN_SCREEN,
  5: COMMENTARY_PLAYER_SELECTION_SCREEN,
};

const getScreenNumber = (screen) => {
  for (const key in ALL_SCREENS) {
    if (ALL_SCREENS[key] === screen) return key;
  }
  return undefined;
};

const navigateTo = "/commentary";
function CommentaryMaster() {
  const pageName = TAB_COMMENTARY;
  const [commentaryData, setCommentaryData] = useState(undefined);
  const [currentScreen, setCurrentScreen] = useState(undefined);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [nextScreen, setNextScreen] = useState(undefined);
  const [nextData, setNextData] = useState(undefined);
  const [statusPopup, setStatusPopup] = useState(undefined);
  const [statusList, setStatusList] = useState([]);
  const [isBetAllow, setIsBetAllow] = useState(false);
  const [isNewUi, setIsNewUi] = useState(false);
  const [isPredict, setIsPredict] = useState(false);
  const [isPredictToggle, setIsPredictToggle] = useState(false);
  const [IsCommentaryWithUndo, setIsCommentaryWithUndo] = useState(false);
  const { isCommentaryDataUpdated, isCommentaryBallLoading } = useSelector(
    (state) => state.tabsData.commentary
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const commentaryId = +sessionStorage.getItem("commentaryMasterId") || "0";
  const commentaryList = sessionStorage.getItem("commentary");
  let scorecardFrameUrl = loadInitData.find(item => item.key === loadInit.SCORECARD_FRAME_URL)?.value;
  if (scorecardFrameUrl) {
    scorecardFrameUrl = scorecardFrameUrl.replace("{commentaryId}", commentaryId);
  }
  // const commentaryId = location.state?.commentaryId || "0";
  // const scoreCardUrl =
  //   process.env.REACT_APP_SCORECARD_URL || "https://deployed.live";
  const socket = createSocket();
  const [undoInningsPopup, setUndoInningsPopup] = useState(false);

  function formatDateTime(isoString) {
    const date = new Date(isoString);

    // Get parts of the date
    const day = date.getUTCDate();
    const month = date.toLocaleString("default", { month: "short" }); // Get month as short name
    const year = date.getUTCFullYear().toString().slice(-2); // Get last two digits of the year
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Format the time
    const formattedTime = `${hours % 12 || 12}:${minutes
      .toString()
      .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

    // Add ordinal suffix to the day
    const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // Covers 11th to 19th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    // Create the formatted date string
    const formattedDate = `${day} ${month} ${year}`;

    // Return as an object
    return {
      date: formattedDate,
      time: formattedTime,
    };
  }

  const OffsymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          // paddingRight: "2px",
        }}
      >
        {" "}
        Bet Allow
      </div>
    );
  };
  const OnSymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          // paddingRight: 4,
          paddingLeft: "10px",
        }}
      >
        {" "}
        Bet Allow
      </div>
    );
  };

  const updateDisplayStatus = (displayStatus) => {
    dispatch(
      updateCommentaryDisplayStatus({
        commentaryId: commentaryId,
        displayStatus: displayStatus,
      })
    );
  };
  useEffect(() => {
    if (!isEmpty(commentaryData))
      document.title = `CM ${commentaryData.commentaryDetails.eid} ${commentaryData.commentaryDetails.en}`;
  }, [commentaryData]);

  const saveUserInfo = async () => {
    setIsDataLoading(true);
    await axiosInstance
      .post("/admin/commentaryScoringLogs/save", { commentaryId })
      .then(async (response) => {
        setIsDataLoading(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsDataLoading(false);
      });
  };

  useEffect(() => {
    if (commentaryId !== "0") {
      fetchData(commentaryId);
      saveUserInfo();
    }
  }, [commentaryId]);

  useEffect(() => {
    const hasCommentaryPermission = checkPermission(permissionObj, TAB_COMMENTARY, PERMISSION_VIEW);
    const hasCommentaryListPermission = checkPermission(permissionObj, TAB_COMMENTARY_LIST, PERMISSION_VIEW);

    if (!hasCommentaryPermission && !hasCommentaryListPermission && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
  }, [permissionObj]); // Runs again when permissionObj updates
  

  useEffect(() => {
    if(isCommentaryDataUpdated){
      dispatch(updateSavedState(undefined));
      if (currentScreen != 3 && currentScreen != 4) {
        setCurrentScreen(nextScreen);
        setCommentaryData(nextData);
      }
    }
  }, [isCommentaryDataUpdated]);

  const fetchData = async () => {
    setIsDataLoading(true);
    let commentaryDataToUpdate = {};
    await axiosInstance
      .post("/admin/commentary/detailsById", { commentaryId })
      .then(async (response) => {
        commentaryDataToUpdate = response?.result;
        console.log("🔄 fetchCommentaryData API called",response);
        setCurrentScreen(
          commentaryDataToUpdate?.commentaryDetails?.commentaryStatus || 1
        );
        setCommentaryData(commentaryDataToUpdate);
        setStatusList(commentaryDataToUpdate.commentaryDisplayStatus);
        setIsPredict(commentaryDataToUpdate?.commentaryDetails?.isPredictMarket || false);
        if(commentaryDataToUpdate?.commentaryDetails?.isPredictMarket) {
          setIsPredictToggle(true);
        }
        setIsDataLoading(false);
        // if (response?.result?.callPrediction?.predictioncallSuccess === false) {
        //     const predictionMessage = response?.result?.callPrediction?.predictionMessage;
        //     const endPoint = response?.result?.callPrediction?.endPoint;
        //     dispatch(
        //         updateToastData({
        //             data: `${endPoint}\n${predictionMessage}`,
        //             title: "Call Prediction",
        //             type: WARNING,
        //         })
        //     );
        // }
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsDataLoading(false);
      });
    return commentaryDataToUpdate;
  };
  useEffect(() => {
    if (
      !isEmpty(commentaryData) &&
      (ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN ||
        ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN)
    ) {
      if (socket) {
        socket.emit(BET_ALLOW, {
          commentaryId: commentaryData.commentaryDetails?.commentaryId,
          betAllow: isBetAllow,
          eventRefId: commentaryData.commentaryDetails?.eventRefId,
        });
      }
    }
  }, [commentaryData, isBetAllow]);

  const openIframePopup = () => {
    const url = scorecardFrameUrl;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleSaveClick = async (dataToSave, nextScreen, nextData) => {
    if (dataToSave) {
      dispatch(addCommentaryScreenData(dataToSave));
      setNextData(nextData);
      setNextScreen(nextScreen);
    }
  };
  const handleInningsChange = () => {
    if (commentaryId !== "0") {
      fetchData(commentaryId);
    }
  };
  const handleBackClick = () => {
    navigate(navigateTo);
  };
  const handleLoadCommentaryClick = () => {
    dispatch(loadCommentaryFeature({ commentaryId }));
  };

  const handleBallStartClick = () => {
    if (socket) {
      socket.emit(COMMENTARY_UPDATE, { ballStatus: BALL_START_STATUS, eventRefId: commentaryData.commentaryDetails?.eventRefId, commentaryId: commentaryId });
    }
    dispatch(updateCommentaryBallStatus({
      "commentaryId": commentaryId,
      "displayStatus": BOWLER_CHANGE_DISPLAY_STATUS,
      // "commentaryPlayerId": onPitchPlayers[ON_STRIKE].commentaryPlayerId,
    }))
  };

  const renderDate = (date) => {
    const [datee, month, year] = date.split(" ");
    return (
      <div>
        <span className="event-date">{datee} </span>
        <span className="" style={{ color: "#FF0000" }}>
          {`${month} '${year}`}
        </span>
      </div>
    );
  };

  // const isSaveOrEditPermission = checkPermission(permissionObj, pageName, PERMISSION_ADD) || checkPermission(permissionObj, pageName, PERMISSION_EDIT)
  return (
    <React.Fragment>
      <div className="commentary-content ">
        <Container fluid={true}>
          <Row className="min-vh-100">
            <Card className="p-0 commentary-body m-0">
              <CardBody className="card-css">
                {((isCommentaryBallLoading && currentScreen !== 3) ||
                  isDataLoading || !commentaryData) && <SpinnerModel />}
                {isNewUi ? (
                  <Row className="mb-3">
                    <Col className="p-0" xs={12}>
                      {/* {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && ( */}
                      <div className="d-flex flex-wrap justify-content-between">
                        {commentaryData ? <div className="d-flex flex-wrap align-items-center gap-2">
                          <span
                            className="logo-lg"
                            style={{ alignItems: "center" }}
                          >
                            <img src={logoDark} alt="logo-dark" height="38" />
                          </span>
                          <div>
                            <div
                              className="score-header-event-type"
                            >{`${commentaryData.commentaryDetails.com}`}</div>
                            <div className="text-uppercase score-header-event-name"
                            >{`${commentaryData.commentaryDetails.en}`}</div>
                          </div>
                          <div className="score-header-date-btn">
                            {renderDate(
                              formatDateTime(
                                commentaryData.commentaryDetails.eventDate
                              ).date
                            )}
                          </div>
                          <div
                            className="score-header-date-btn"
                            style={{ color: "#00B400" }}
                          >
                            {
                              formatDateTime(
                                commentaryData.commentaryDetails.eventDate
                              ).time
                            }
                          </div>
                        </div> : null}
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {/* {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && ( */}
                          <>
                              <NetworkStatus newUi={true}/>
                            {
                              commentaryList === 'commentary' &&
                              <div className="d-flex align-items-center py-2">
                                <span>Bet Allow</span>
                                <Switch
                                  width={70}
                                  uncheckedIcon={<OffsymbolStatus />}
                                  checkedIcon={<OnSymbolStatus />}
                                  className="pe-0 mx-2"
                                  onColor="#02a499"
                                  onChange={() => {
                                    setIsBetAllow(!isBetAllow);
                                  }}
                                  checked={isBetAllow}
                                />
                              </div>
                            }
                            {/* <button
                                  className="score-header-navigation-btns"
                                  onClick={() => {
                                    setIsNewUi(!isNewUi);
                                  }}
                                >
                                  Old Ui
                              </button> */}
                            {commentaryList === 'commentary' &&
                              <button
                                className="score-header-navigation-btns"
                                onClick={handleLoadCommentaryClick}
                              >
                                Load Commentary
                              </button>
                            }
                            <button
                              className="score-header-navigation-btns"
                              onClick={openIframePopup}
                            >
                              Scorecard
                            </button>
                          </>
                          {/* )} */}
                          <button className="score-header-navigation-btns">
                            <img
                              role="button"
                              className="sticky-button"
                              onClick={() => setStatusPopup(true)}
                              src="icons/commentary.png"
                              alt="Icon"
                            />
                          </button>
                          <button className="score-header-exit-btn"
                            onClick={handleBackClick}
                          >
                            Exit
                          </button>
                        </div>
                      </div>
                      {/* )} */}
                    </Col>
                  </Row>
                ) : (
                  <Row className='mb-3'>
                    {/* <Col className="p-0" xs={12} md={6} lg={6}> */}
                    {/* {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && */}
                    {/* <>
                            <div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                            <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${commentaryData?.commentaryDetails.ed + " " + commentaryData?.commentaryDetails.et} ]`}</div>
                          </> */}
                    {/* // } */}
                    {/* </Col> */}
                    <Col className="p-0 d-flex flex-wrap">
                      <div className="col-12 col-md-6">
                        {commentaryData ? <><div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                          <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${commentaryData?.commentaryDetails.ed + " " + commentaryData?.commentaryDetails.et} ]`}</div></> : null}
                      </div>
                      <div className='col-12 col-md-6 d-flex align-items-center justify-content-md-end mt-2 mt-md-0'>
                        {(ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN || ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN) && commentaryList === 'commentary' &&
                          <div className="d-flex align-items-center py-2">
                            <span>Bet Allow</span>
                            <Switch
                              width={70}
                              uncheckedIcon={<OffsymbolStatus />}
                              checkedIcon={<OnSymbolStatus />}
                              className="pe-0 mx-2"
                              onColor="#02a499"
                              onChange={() => {
                                setIsBetAllow(!isBetAllow);
                              }}
                              checked={isBetAllow}
                            />
                          </div>
                        }
                        <Button color="danger" className=" mx-1 text-right" onClick={handleBackClick}>Exit</Button>
                      </div>
                      {/* {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && */}
                      <div className="col-12 col-md-12 d-flex flex-wrap align-items-center justify-content-between my-2 float-end">
                              <NetworkStatus/>
                        <div>
                          {/* {(ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN && commentaryData?.commentaryTeams?.some(team => team.isBattingComplete)) ? <Button color="warning" className="mx-1" onClick={() => setUndoInningsPopup(true)}>Undo Innings</Button> : null} */}
                          {commentaryList === 'commentary' && <Button color="primary" className="mx-1" onClick={handleLoadCommentaryClick}>Load Commentary</Button>}
                          <Button color="primary" className="mx-1" onClick={openIframePopup}>Scorecard</Button>
                          {/* <Button color="primary" className="mx-1 my-2 my-md-0" onClick={() => {setIsNewUi(!isNewUi)}}>New Ui</Button> */}
                          {(ALL_SCREENS[currentScreen] === COMMENTARY_TOSS_SCREEN || ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN) ? <Button color="primary" className="mx-1 my-2 my-md-0" onClick={handleBallStartClick}>Ball Start</Button> : null}
                        </div>
                      </div>
                      {/* // } */}
                    </Col>
                  </Row>
                )}
                <>
                  {ALL_SCREENS[currentScreen] === COMMENTARY_TOSS_SCREEN && (
                    <>
                      {!isNewUi ? <Toss
                        data={commentaryData}
                        save={handleSaveClick}
                        isPredictToggle={isPredictToggle}
                        next={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_PLAYER_SELECTION_SCREEN)
                          );
                        }}
                    />: <TossScreen 
                        data={commentaryData}
                        save={handleSaveClick}
                        isPredictToggle={isPredictToggle}
                        next={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_PLAYER_SELECTION_SCREEN)
                          );
                        }}
                      />}
                    </>
                  )}
                  {ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN && (
                    <>
                      {!isNewUi ? <PlayerSelection
                        data={commentaryData}
                        save={handleSaveClick}
                        isPredictToggle={isPredictToggle}
                        previous={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_TOSS_SCREEN)
                          );
                        }}
                        next={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_MAIN_SCREEN)
                          );
                        }}
                        undoNext={() => {
                          setIsCommentaryWithUndo(true)
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_MAIN_SCREEN)
                          );
                        }}
                        fetchData={fetchData}
                        undoInningsPopup={undoInningsPopup}
                        setUndoInningsPopup={setUndoInningsPopup}
                      /> : <PlayerSelectionScreen
                        data={commentaryData}
                        save={handleSaveClick}
                        isPredictToggle={isPredictToggle}
                        previous={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_TOSS_SCREEN)
                          );
                        }}
                        next={() => {
                          setCurrentScreen(
                            getScreenNumber(COMMENTARY_MAIN_SCREEN)
                          );
                        }}
                      />}
                    </>
                  )}
                  {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && (
                    <Commentary
                      refId={commentaryData.commentaryDetails.eid}
                      data={{ commentaryData }}
                      onInningsChange={handleInningsChange}
                      isDataLoading={isDataLoading}
                      statusPopup={statusPopup}
                      saveUserInfo={saveUserInfo}
                      isNewUi={isNewUi}
                      isPredict={isPredict}
                      setIsPredict={setIsPredict}
                      isPredictToggle={isPredictToggle}
                      setIsPredictToggle={setIsPredictToggle}
                      fetchData={fetchData}
                      IsCommentaryWithUndo={IsCommentaryWithUndo}
                      toggleCommenatryWithUndo={() => setIsCommentaryWithUndo(!IsCommentaryWithUndo)}
                    />
                  )}
                  {!isNewUi && <Col xs={12} md={6} lg={6}>
                    <img
                      role="button"
                      className="commentary-sticky-button"
                      onClick={() => setStatusPopup(true)}
                      src="icons/commentaryicon.png"
                      alt="Icon"
                    />
                  </Col>}
                  {statusPopup && (
                    <ChangeStatusModal
                      statusList={statusList}
                      toggle={() => setStatusPopup(undefined)}
                      onSubmit={(displayStatus) => {
                        setStatusPopup(undefined);
                        updateDisplayStatus(displayStatus);
                      }}
                    />
                  )}
                </>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default CommentaryMaster;
