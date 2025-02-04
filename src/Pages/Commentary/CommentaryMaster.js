import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  BET_ALLOW,
  COMMENTARY_MAIN_SCREEN,
  COMMENTARY_PLAYER_SELECTION_SCREEN,
  COMMENTARY_TOSS_SCREEN,
  ERROR,
  PERMISSION_ADD,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SAVE,
  SAVE_AND_CLOSE,
  SAVE_AND_NEXT,
  SUCCESS,
  TAB_COMMENTARY,
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

const ALL_SCREENS = {
  1: COMMENTARY_TOSS_SCREEN,
  2: COMMENTARY_PLAYER_SELECTION_SCREEN,
  3: COMMENTARY_MAIN_SCREEN,
  4: COMMENTARY_MAIN_SCREEN,
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
  const { isCommentaryDataUpdated, isCommentaryBallLoading } = useSelector(
    (state) => state.tabsData.commentary
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  // const commentaryId = location.state?.commentaryId || "0";
  const commentaryId = +localStorage.getItem("commentaryMasterId") || "0";
  const scoreCardUrl =
    process.env.REACT_APP_SCORECARD_URL || "https://deployed.live";
  const socket = createSocket();

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
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (isCommentaryDataUpdated && currentScreen !== 3) {
      dispatch(updateSavedState(undefined));
      setCurrentScreen(nextScreen);
      setCommentaryData(nextData);
    }
  }, [isCommentaryDataUpdated]);

  const fetchData = async () => {
    setIsDataLoading(true);
    let commentaryDataToUpdate = {};
    await axiosInstance
      .post("/admin/commentary/detailsById", { commentaryId })
      .then(async (response) => {
        commentaryDataToUpdate = response?.result;
        setCurrentScreen(
          commentaryDataToUpdate?.commentaryDetails?.commentaryStatus || 1
        );
        setCommentaryData(commentaryDataToUpdate);
        setStatusList(commentaryDataToUpdate.commentaryDisplayStatus);
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
    const url = `${scoreCardUrl}/scoreboard?id=${commentaryData?.commentaryDetails?.eid}&color=000`;
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

  const renderDate = (date) => {
    const [datee, month, year] = date.split(" ");
    return (
      <div>
        <span className="">{datee} </span>
        <span className="" style={{ color: "#FF0000" }}>
          {`${month} '${year}`}
        </span>
      </div>
    );
  };

  // const isSaveOrEditPermission = checkPermission(permissionObj, pageName, PERMISSION_ADD) || checkPermission(permissionObj, pageName, PERMISSION_EDIT)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card style={{ padding: "0px" }}>
              <CardBody>
                {((isCommentaryBallLoading && currentScreen !== 3) ||
                  isDataLoading) && <SpinnerModel />}
              {isNewUi ? (
                <Row className="mb-3">
                  <Col className="pt-2" xs={12}>
                    {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && (
                      <div className="d-flex flex-wrap justify-content-between">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <span
                            className="logo-lg"
                            style={{ alignItems: "center" }}
                          >
                            <img src={logoDark} alt="logo-dark" height="38" />
                          </span>
                          <div>
                            <div
                              className="score-header-event-type"
                              style={{ color: "#999999", fontSize: "10px" }}
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
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN && (
                            <>
                              <NetworkStatus />
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
                                <button
                                  className="score-header-navigation-btns"
                                  onClick={() => {
                                    setIsNewUi(!isNewUi);
                                  }}
                                >
                                  Old Ui
                              </button>
                              <button 
                                className="score-header-navigation-btns"
                                onClick={handleLoadCommentaryClick}
                              >
                                Load Commentary
                              </button>
                              <button 
                                className="score-header-navigation-btns"
                                onClick={openIframePopup}
                              >
                                Scorecard
                              </button>
                            </>
                          )}
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
                    )}
                  </Col>
                </Row>
                ) : (
                  <Row className='mb-3'>
                      <Col className="pt-2" xs={12} md={6} lg={6} >
                        {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                          <>
                            <div className='match-details-breadcrumbs'>{`${commentaryData.commentaryDetails.ety}/ ${commentaryData.commentaryDetails.com}/ ${commentaryData.commentaryDetails.en}`}</div>
                            <div>{`Ref: ${commentaryData.commentaryDetails.eid} [ ${commentaryData.commentaryDetails.ed + " " + commentaryData.commentaryDetails.et} ]`}</div>
                          </>}
                      </Col>
                      <Col className="pt-2" xs={12} md={6} lg={6}>
                        <div className='d-flex align-items-center justify-content-end'>
                          {(ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN || ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN) &&
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
                            </div>}
                            <Button color="danger" className=" mx-1 text-right" onClick={handleBackClick}>Exit</Button>
                        </div>
                          {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                            <>
                              <NetworkStatus />
                              <Button color="primary" className="mx-1 text-right" onClick={handleLoadCommentaryClick}>Load Commentary</Button>
                              <Button color="primary" className="mx-1 text-right" onClick={openIframePopup}>Scorecard</Button>
                              <Button color="primary" className="mx-1 text-right" onClick={() => {setIsNewUi(!isNewUi)}}>New Ui</Button>
                            </>}
                      </Col>
                  </Row>
                )}
                <Row>
                  {ALL_SCREENS[currentScreen] === COMMENTARY_TOSS_SCREEN && (
                    <Toss
                      data={commentaryData}
                      save={handleSaveClick}
                      next={() => {
                        setCurrentScreen(
                          getScreenNumber(COMMENTARY_PLAYER_SELECTION_SCREEN)
                        );
                      }}
                    />
                  )}
                  {ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN && (
                    <PlayerSelection
                      data={commentaryData}
                      save={handleSaveClick}
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
                    />
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
                    />
                  )}
                  {/* <Col xs={12} md={6} lg={6}>
                    <img
                      role="button"
                      className="sticky-button"
                      onClick={() => setStatusPopup(true)}
                      src="icons/commentary.png"
                      alt="Icon"
                    />
                  </Col> */}
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
                </Row>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default CommentaryMaster;
