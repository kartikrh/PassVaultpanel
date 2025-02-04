import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import "./CommentaryCss.css";
import Switch from "react-switch";

import {
  RETIRED_HURT_BATTER,
  PREV_ON_STRIKE,
  PREV_NON_STRIKE,
  PLAYER_LIST,
  BALL_BYE,
  EXTRAS,
  BALL_LEG_BYE,
  BALL_WIDE,
  WICKET,
  BATTING_TEAM,
  BOWLER_CHANGE_DISPLAY_STATUS,
  BOWLING_TEAM,
  CURRENT_BOWLER,
  NON_STRIKE,
  NO_BALL,
  NO_BALL_BYE,
  NO_BALL_LEG_BYE,
  ON_STRIKE,
  BOLD,
  CATCH,
  EXTRAS_WICKET_TYPE,
  HIT_BALL_TWICE,
  HIT_WICKET,
  LBW,
  LIST_TO_EXCLUDE_WICKET_FOR_BOWLER,
  OBSTRACT_THE_FIELDING,
  RETIRED_OUT,
  RUN_OUT,
  STUMP,
  TIMED_OUT,
  WICKET_TYPE_LIST,
} from "./CommentartConst";
import { useDispatch, useSelector } from "react-redux";
import CommentaryRightPanel from "./Helpers/CommentaryRightPanel";
import styled from "styled-components";
import CommentaryAction from "./CommentaryModels/CommentaryAction";
import RevertModal from "./CommentaryModels/RevertCommentary";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import Select from "react-select";
import CardComponent from "./CardComponent";
import SelectPlayerControls from "./CommentryRightControls/SelectPlayerControls";
import { generateBallLabelFromBall } from "./functions";
import RunsControls from "./CommentryRightControls/RunsControls";
import { PenaltyControls } from "./CommentryRightControls/PenaltyControls";
import CricketFieldControls from "./CommentryRightControls/CricketFieldControls";
import WicketControls from "./CommentryRightControls/WicketControls";
import ExtrasControl from "./CommentryRightControls/ExtrasControl";
import ChangeInningsControls from "./CommentryRightControls/ChangeInningsControls";
import RevertControls from "./CommentryRightControls/RevertControls";
import RetiredHurtControls from "./CommentryRightControls/RetiredHurtControls";

const CenteredBadge = styled.div`
  position: absolute;
  background: linear-gradient(180deg, #3e119e -60.91%, #35127d 221.1%);
  color: #ffffff;
  padding: 6px 30px 6px;
  top: -15px;
  right: 50%;
  font-size: 12px;
  transform: translateX(50%);
  border-radius: 0px 0px 55% 55% / 0px 0px 30px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
`;

const Background = styled.div`
  position: absolute;
  top: -15px;
  right: 33%;
  width: 115px;
  height: 15px;
  background: linear-gradient(180deg, #3e119e -60.91%, #35127d 221.1%);
`;

const CenteredBadgeBowler = styled.div`
  position: absolute;
  background: #00b400;
  color: #ffffff;
  padding: 6px 30px 6px;
  top: -15px;
  right: 50%;
  font-size: 12px;
  transform: translateX(50%);
  border-radius: 0px 0px 55% 55% / 0px 0px 30px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
`;

const BackgroundBowler = styled.div`
  position: absolute;
  top: -15px;
  right: 32%;
  width: 120px;
  height: 15px;
  background: #00b400;
`;

const NewCommentaryScreen = ({
  refId,
  teamDetails,
  onPitchPlayers,
  updateRuns,
  changePlayer,
  changeOver,
  updateExtras,
  onWicketClick,
  onUndoClick,
  changeStrike,
  endInnings,
  isLoading,
  changeBowler,
  updateDisplayStatus,
  showPaneltyRuns,
  overBalls,
  anyPopup,
  handleRetiredHurt = {},
  target,
  partnerships,
  commentaryId,
  handleWheelShowToggle,
  isWheelShow,
  overHistory,
  players,
  currentOver,
  showWicketModal,
  showChangeOverModal,
  showPlayerModal,
  bowlingTeam,
  bowlingTeamDetails,
  toggle,
  isOpen,
  onSubmit,
  onNoClick,
  onYesClick,
  battingTeam,
  bowlerName,
  overPopUpForBowler,
  isBowler,
  playerList,
  selectPlayer,
  extraType,
  extrasTypeIsOpen,
  updateExtrasExtrasType,
  extrasTypeToggle,
  retiredHurttoggle,
  retiredHurtonsubmit,
  onPitchplayers,
  retiredHurtplayerList,
  allBattingPlayers,
  retiredHurtisOpen,
  // revertModalisOpen,
  // revertModaltoggle,
  // revertModalonNoClick,
  // revertModalonYesClick,
  inningsChangeisOpen,
  inningsChangetoggle,
  inningsChangeNoClick,
  inningsChangeYesClick,
  isSelectPlayerModalOpen,
  selectPlayerModalProps,
  PenaltyToggle,
  PenaltyIsOpen,
  PenaltySelectedPenalty,
  cricketFieldData,
  shotTypes,
  isShotType,
  handleShotTypeToggle,
  cricketFieldIsOpen,
  cricketFieldToggle,
}) => {
  const [changePlayerType, setChangePlayerType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionPopup, setActionPopup] = useState(undefined);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showRunsPopup, setShowRunsPopup] = useState(false);
  const dispatch = useDispatch();
  const [bowlingPlayerList, setBowlingPlayerList] = useState([]);

  const matchData = {
    maxOvers: 20,
    refId: 223,
  };

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
          // paddingRight: 2,
        }}
      >
        {" "}
        wheel
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
        }}
      >
        {" "}
        wheel
      </div>
    );
  };

  const handleRevertToToss = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/admin/commentary/revertCommentary",
        { commentaryId }
      );

      dispatch(
        updateToastData({
          data: response?.message || "Successfully reverted to toss",
          title: response?.title || "Success",
          type: "SUCCESS",
        })
      );
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setLoading(false);
      dispatch(
        updateToastData({
          data: error?.message || "Failed to revert to toss",
          title: error?.title || "Error",
          type: "ERROR",
        })
      );
    }
  };

  const handleKeyPress = (event) => {
    const key = event.key.toLowerCase(); // Convert to lowercase to simplify the switch cases
    switch (key) {
      case "0":
        handleRuns(0, 1);
        break;
      case "1":
        handleRuns(1, 1);
        break;
      case "2":
        handleRuns(2, 1);
        break;
      case "-":
        onUndoClick();
        break;
      case "3":
        handleRuns(3, 1);
        break;
      case "4":
        handleRuns(4, 1, true);
        break;
      case "6":
        handleRuns(6, 1, true);
        break;
      // case '/':
      //     updateExtras(BALL_WIDE)
      //     break;
      // case '*':
      //     updateExtras(NO_BALL);
      //     break;
      case "+":
        updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS);
        break;
      // case '-':
      //     setStatusPopup(true)
      //     break;
      // case 'a':
      //     updateExtras(BALL_BYE)
      //     break;
      // case 's':
      //     updateExtras(NO_BALL_BYE);
      //     break;
      // case 'c':
      //     console.log("Actions")
      //     break;
      // case '.':
      //     onWicketClick();
      //     break;
      default:
        break;
    }
  };
  const handleRuns = (run, ball, isBoundary = false) => {
    updateRuns({
      run: run,
      ball: ball,
      batter: onPitchPlayers[ON_STRIKE],
      bowler: onPitchPlayers[CURRENT_BOWLER],
      isBoundary,
    });
  };

  let filteredPartnerships = partnerships
    ?.filter((obj) => obj.batter1Id !== null && obj.batter2Id !== null) // Filter out entries with null batter IDs
    ?.filter(
      (value, index, self) =>
        index ===
        self.findLastIndex(
          (t) =>
            (t.batter1Id === value.batter1Id &&
              t.batter2Id === value.batter2Id) ||
            (t.batter1Id === value.batter2Id && t.batter2Id === value.batter1Id) // Check for both combinations to handle swapped order
        )
    )
    .reverse();

  useEffect(() => {
    if (anyPopup || actionPopup)
      window.removeEventListener("keydown", handleKeyPress);
    else {
      window.addEventListener("keydown", handleKeyPress);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onPitchPlayers, onUndoClick, anyPopup, actionPopup]);

  // extra component

  const defaultValue = extraType === BALL_WIDE || extraType === NO_BALL ? 0 : 1;
  const [run, setRun] = useState(defaultValue);
  const [isBoundary, setIsBoundary] = useState(undefined);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [run]);
  useEffect(() => {
    if (extrasTypeIsOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById("runs");
        if (inputElement) inputElement.focus();
      }, 150);
    }
  }, [extrasTypeIsOpen]);

  // extra component

  // retired hut
 
  // retired hut

  const generateBallfromArray = (ballArray = []) => {
    return ballArray?.map((element, index) => {
      const previousValue = ballArray[index - 1];
      const nextValue = ballArray[index + 1];
      const isWicket = +element?.isWicket !== 0;
      const isBoundary = +element?.value === 6 || +element?.value === 4;
      // const isBoundary = +element?.isBoundary !== 0
      const ballTypeAdd = generateBallLabelFromBall(element?.type, isWicket);
      const ballColor = isWicket
        ? "wicket-overball"
        : ballTypeAdd
        ? "extra-overball"
        : isBoundary
        ? "boundary-overball"
        : "regular-overball";
      const ballFontColor = isWicket
        ? "text-white"
        : ballTypeAdd
        ? "text-white"
        : isBoundary
        ? "text-white"
        : "text-muted";
      const ballValue = ballTypeAdd
        ? element.value > 0
          ? element.value
          : ""
        : element.value;
      if (
        previousValue &&
        previousValue.isWicket &&
        previousValue?.overCount === element?.overCount
      ) {
        return null;
      }
      let displayValue;
      if (
        isWicket &&
        nextValue &&
        nextValue?.overCount === element?.overCount
      ) {
        const nextIsWicket = +nextValue?.isWicket !== 0;
        const nextBallTypeAdd = generateBallLabelFromBall(
          nextValue?.type,
          nextIsWicket
        );
        const nextBallValue = nextBallTypeAdd
          ? nextValue.value > 0
            ? nextValue.value
            : ""
          : nextValue.value;
        displayValue = `${nextBallValue} ${
          nextBallTypeAdd && nextBallValue ? "|" : ""
        }${nextBallTypeAdd || ""}W`;
      } else {
        displayValue = `${ballValue} ${ballTypeAdd && ballValue ? "| " : ""} ${
          ballTypeAdd || ""
        }`;
      }
      return (
        <div
          key={`ball ${index}`}
          className={`d-flex justify-content-center align-items-center ${ballColor}`}
        >
          {/* return <div key={`ball ${index}`} className={`px-0.5 py-0.5 shadow-sm rounded mx-1 over-ball-display ${ballColor} ${ballFontColor}`}> */}
          {displayValue}
        </div>
      );
    });
  };

  const nextOverNumber = Math.ceil(currentOver?.over || 0) + 1;

  const overKey = `${currentOver?.currentInnings}_##_${battingTeam?.teamId}_##_${nextOverNumber}`;
  const currentOverBalls = overBalls[overKey] || [];

  const stats = {
    runs: battingTeam?.teamScore || 0,
    overs: Math.ceil(battingTeam?.teamOver || 0),
    wickets: battingTeam?.teamWicket || 0,
    extras:
      (battingTeam?.teamWideRuns || 0) +
      (battingTeam?.teamByRuns || 0) +
      (battingTeam?.teamLegByRuns || 0) +
      (battingTeam?.teamNoBallRuns || 0) +
      (battingTeam?.teamPenaltyRuns || 0),
  };

  const check = () => {
    showWicketModal &&
      toggle()(retiredHurtisOpen && !changePlayerType) &&
      retiredHurttoggle();
    extrasTypeIsOpen && extrasTypeToggle();
    actionPopup && setActionPopup(false);
    showRunsPopup && setShowRunsPopup(false);
    cricketFieldIsOpen && cricketFieldToggle();
  };

  return (
    <div className="container-fluid text-white py-4">
      {/* Score Section */}
      <Row>
        <Col xs={12} md={7} lg={7}>
          <div className="d-md-flex gap-3 my-1 mb-3">
            <div className="position-relative w-100 max-w-md p-4 rounded score-card">
              {/* Corner cuts */}
              <div className="position-absolute box-card box-top-left"></div>
              <div className="position-absolute box-card box-top-right"></div>
              <div className="position-absolute box-card box-bottom-right"></div>
              <div className="position-absolute box-card box-bottom-left"></div>

              {/* Side semicircle cuts */}
              <div className="position-absolute box-card box-left-semicircle"></div>
              <div className="position-absolute box-card box-right-semicircle"></div>

              <Background
                bgColor={teamDetails?.[BATTING_TEAM].backgroundColor}
              />
              <CenteredBadge
                bgColor={teamDetails?.[BATTING_TEAM].backgroundColor}
              >
                BATTING
              </CenteredBadge>

              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div
                  className="fs-5 fw-medium"
                  style={{
                    color: teamDetails?.[BATTING_TEAM]?.teamColor || "white",
                  }}
                >
                  {teamDetails?.[BATTING_TEAM].teamName}
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="ms-3"
                    style={{
                      color: teamDetails?.[BATTING_TEAM]?.teamColor || "white",
                    }}
                  >
                    {teamDetails?.[BATTING_TEAM]?.teamScore || 0}/
                    {teamDetails?.[BATTING_TEAM]?.teamWicket || 0}
                    &nbsp;({teamDetails?.[BATTING_TEAM]?.teamOver || 0}) &nbsp;
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span
                      className={`fw-medium`}
                      onClick={() => {
                        changeStrike(
                          onPitchPlayers[ON_STRIKE].commentaryPlayerId
                        );
                      }}
                    >
                      {onPitchPlayers[ON_STRIKE]?.playerName}
                    </span>
                    <span className="ms-1 text-info fs-6">*</span>
                    <button
                      onClick={() => {
                        changePlayer(ON_STRIKE);
                      }}
                      className="tab-button active text-right rounded-circle mx-2"
                      // style={{
                      //   backgroundColor: teamDetails?.[BATTING_TEAM].backgroundColor,
                      //   color: "#ffffff",
                      // }}
                    >
                      C
                    </button>
                  </div>
                  <div className={``}>
                    {onPitchPlayers[ON_STRIKE]?.batRun || 0} (
                    {onPitchPlayers[ON_STRIKE]?.batBall || 0})
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 text-secondary">
                  <div className="d-flex align-items-center">
                    <span
                      className={`fw-medium`}
                      onClick={() => {
                        changeStrike(
                          onPitchPlayers[NON_STRIKE].commentaryPlayerId
                        );
                      }}
                    >
                      {onPitchPlayers[NON_STRIKE]?.playerName}
                    </span>
                    <button
                      onClick={() => {
                        changePlayer(NON_STRIKE);
                      }}
                      className="tab-button active text-right rounded-circle mx-2"
                      style={{
                        backgroundColor:
                          teamDetails?.[BATTING_TEAM].backgroundColor,
                        color: "#ffffff",
                      }}
                    >
                      C
                    </button>
                  </div>
                  <div className={``}>
                    {onPitchPlayers[NON_STRIKE]?.batRun || 0} (
                    {onPitchPlayers[NON_STRIKE]?.batBall || 0})
                  </div>
                </div>
              </div>
            </div>

            <div className="position-relative w-100 max-w-md p-4 rounded score-card">
              {/* Corner cuts */}
              <div className="position-absolute box-card box-top-left"></div>
              <div className="position-absolute box-card box-top-right"></div>
              <div className="position-absolute box-card box-bottom-right"></div>
              <div className="position-absolute box-card box-bottom-left"></div>

              {/* Side semicircle cuts */}
              <div className="position-absolute box-card box-left-semicircle"></div>
              <div className="position-absolute box-card box-right-semicircle"></div>

              <BackgroundBowler
                bgColor={teamDetails?.[BOWLING_TEAM].backgroundColor}
              />
              <CenteredBadgeBowler
                bgColor={teamDetails?.[BOWLING_TEAM].backgroundColor}
              >
                BOWLING
              </CenteredBadgeBowler>
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2 p">
                <div
                  className="fs-5 fw-medium"
                  style={{
                    color: teamDetails?.[BOWLING_TEAM]?.teamColor || "white",
                  }}
                >
                  {teamDetails?.[BOWLING_TEAM]?.teamName}
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="ms-3"
                    style={{
                      color: teamDetails?.[BOWLING_TEAM]?.teamColor || "white",
                    }}
                  >
                    {teamDetails?.[BOWLING_TEAM]?.teamScore || 0}/
                    {teamDetails?.[BOWLING_TEAM]?.teamWicket || 0}
                    &nbsp;({teamDetails?.[BOWLING_TEAM]?.teamOver || 0}) &nbsp;
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className={`fw-medium`}>
                      {onPitchPlayers[CURRENT_BOWLER]?.playerName} &nbsp;
                    </span>
                    <button
                      onClick={() => {
                        changePlayer(CURRENT_BOWLER);
                      }}
                      className="tab-button active text-right rounded-circle"
                    >
                      C
                    </button>
                  </div>
                  <div className={``}>
                    <span>
                      {Number(onPitchPlayers[CURRENT_BOWLER]?.bowlerOver) || 0}-
                      {onPitchPlayers[CURRENT_BOWLER]?.bowlerMaidenOver || 0}-
                      {onPitchPlayers[CURRENT_BOWLER]?.bowlerRun || 0}-
                      {onPitchPlayers[CURRENT_BOWLER]?.bowlerTotalWicket || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Center */}
          <div className="control-card bg-secondary text-white mb-4">
            <div className="control-card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title d-flex align-items-center">
                  {(actionPopup ||
                    showWicketModal ||
                    extrasTypeIsOpen ||
                    showChangeOverModal ||
                    cricketFieldIsOpen) && (
                    <button
                      className="control-center-back-btn me-2"
                      onClick={check}
                    >
                      <img
                        role="button"
                        className="back-icon"
                        // onClick={() => setStatusPopup(true)}
                        src="icons/back.png"
                        alt="Icon"
                        style={{ color: "black" }}
                        // height="10px"
                      />
                    </button>
                  )}
                  {showChangeOverModal ? "Over Complete" : "Control Centre"}
                </h5>
                {!showChangeOverModal && (
                  <div className="d-flex align-items-center py-2">
                    <span>Tracking a Ball</span>
                    <Switch
                      width={70}
                      uncheckedIcon={<OffsymbolStatus />}
                      checkedIcon={<OnSymbolStatus />}
                      className="pe-0 mx-2"
                      onColor="#02a499"
                      onChange={() => {
                        handleWheelShowToggle(!isWheelShow);
                      }}
                      checked={isWheelShow}
                    />
                  </div>
                )}
              </div>

              {/* Number Pad */}
              <div className="d-flex justify-content-center m-0 p-0 w-100 g-1">
                {actionPopup ||
                showWicketModal ||
                extrasTypeIsOpen ||
                showChangeOverModal ||
                showPlayerModal ||
                cricketFieldIsOpen ? (
                  <div
                    className={`row row-cols-2 g-2 col-12 ${
                      isLoading ? "disable-button" : ""
                    }`}
                  >
                    {actionPopup ? (
                      <div className="col-12 row row-cols-2">
                        {inningsChangeisOpen ? (
                          <ChangeInningsControls
                            isOpen={inningsChangeisOpen}
                            toggle={inningsChangetoggle}
                            onNoClick={inningsChangeNoClick}
                            onYesClick={inningsChangeYesClick}
                          />
                        ) : showRevertModal ? (
                          <RevertControls
                            isOpen={showRevertModal}
                            toggle={() => setShowRevertModal(false)}
                            onYesClick={() => {
                              handleRevertToToss();
                              setShowRevertModal(false);
                            }}
                            onNoClick={() => setShowRevertModal(false)}
                          />
                        ) : retiredHurtisOpen ? (
                            <RetiredHurtControls
                            toggle={() => {
                              setChangePlayerType(null);
                              setActionPopup(false);
                            }}
                              onsubmit={retiredHurtonsubmit}
                              onPitchPlayers={onPitchPlayers}
                              playerList={retiredHurtplayerList}
                              allBattingPlayers={allBattingPlayers}
                            />
                        ) : showRunsPopup ? (
                            <RunsControls
                              toggle={() => setShowRunsPopup(false)}
                              onSubmitClick={(runs) => handleRuns(runs, 1)}
                            />
                        ) : PenaltyIsOpen ? (
                          <PenaltyControls
                            toggle={PenaltyToggle}
                            isOpen={PenaltyIsOpen}
                            selectedPenalty={PenaltySelectedPenalty}
                          />
                        ) : (
                          <div className="col-8 row row-cols-2">
                            <div
                              className="col my-1"
                              onClick={() => {
                                setShowRunsPopup(true);
                                // setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                5
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                showPaneltyRuns(true);
                                // setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                Penalty
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                updateExtras(NO_BALL_BYE);
                                setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                NB B
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                updateExtras(NO_BALL_LEG_BYE);
                                setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                NB LB
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                changeOver();
                                setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                End Over
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                endInnings();
                              }}
                            >
                              <button className="score-control-action-btns">
                                End inn.
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => {
                                // setActionPopup(false);
                                handleRetiredHurt();
                              }}
                            >
                              <button className="score-control-action-btns">
                                R. Hurt
                              </button>
                            </div>
                            <div
                              className="col my-1"
                              onClick={() => setShowRevertModal(true)}
                            >
                              <button className="score-control-action-btns">
                                R. to Toss
                              </button>
                            </div>
                            {/* <div className="col-12 my-1">
                              <button
                                onClick={() => setActionPopup(false)}
                                className="score-control-close-btn"
                              >
                                Close
                              </button>
                            </div> */}
                          </div>
                        )}
                      </div>
                    ) : showWicketModal ? (
                      <WicketControls
                        isOpen={showWicketModal}
                        toggle={toggle}
                        onSubmit={onSubmit}
                        bowlingTeam={bowlingTeam}
                        bowlingTeamDetails={bowlingTeamDetails}
                        onPitchPlayers={onPitchPlayers}
                        extraType={extraType}
                      />
                    ) : extrasTypeIsOpen ? (
                      <ExtrasControl
                        isOpen={extrasTypeIsOpen}
                        toggle={extrasTypeToggle}
                        extraType={extraType}
                        updateExtras={updateExtrasExtrasType}
                      />
                    ) : showChangeOverModal ? (
                      <>
                        <div className="col-10">
                          <div className="d-flex align-items-center justify-content-cneter gap-4">
                            <div className="over-stat text-center p-3">
                              <div className="over-modal-stat-value">
                                {stats.runs}
                              </div>
                              <div className="over-modal-stat-label">Runs</div>
                            </div>
                            <div className="over-stat text-center p-3">
                              <div className="over-modal-stat-value">
                                {stats.overs}
                              </div>
                              <div className="over-modal-stat-label">Overs</div>
                            </div>
                            <div className="over-stat text-center p-3">
                              <div className="over-modal-stat-value">
                                {stats.wickets}
                              </div>
                              <div className="over-modal-stat-label">
                                Wickets
                              </div>
                            </div>
                            <div className="over-stat text-center p-3">
                              <div className="over-modal-stat-value">
                                {stats.extras}
                              </div>
                              <div className="over-modal-stat-label">
                                Extras
                              </div>
                            </div>
                          </div>

                          <div
                            className="over-modal-player-stats"
                            style={{ border: "none" }}
                          >
                            <div
                              className="over-modal-player-row over-modal-header-row"
                              style={{ border: "none" }}
                            >
                              <div className="over-modal-player-name">
                                Batter
                              </div>
                              <div className="over-modal-player-stat">R</div>
                              <div className="over-modal-player-stat">B</div>
                              <div className="over-modal-player-stat">4s</div>
                              <div className="over-modal-player-stat">6s</div>
                            </div>
                            <div
                              className="over-modal-player-row"
                              style={{ border: "none" }}
                            >
                              <div className="over-modal-player-name">
                                <strong>
                                  {onPitchPlayers[ON_STRIKE]?.playerName +
                                    "*" || "-"}
                                </strong>
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[ON_STRIKE]?.batRun || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[ON_STRIKE]?.batBall || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[ON_STRIKE]?.batFour || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[ON_STRIKE]?.batSix || 0}
                              </div>
                            </div>
                            <div className="over-modal-player-row">
                              <div className="over-modal-player-name">
                                {onPitchPlayers[NON_STRIKE]?.playerName || "-"}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[NON_STRIKE]?.batRun || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[NON_STRIKE]?.batBall || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[NON_STRIKE]?.batFour || 0}
                              </div>
                              <div className="over-modal-player-stat">
                                {onPitchPlayers[NON_STRIKE]?.batSix || 0}
                              </div>
                            </div>
                          </div>

                          <div className="over-modal-info">
                            <div className="over-modal-over-text">
                              End of over{" "}
                              {Math.ceil(battingTeam?.teamOver || 0)} by{" "}
                              {bowlerName}
                            </div>
                            <div className="over-modal-balls-container">
                              {generateBallfromArray(currentOverBalls)}
                              <span className="over-modal-total">
                                = {currentOver?.totalRun}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-4">
                            <div onClick={onYesClick}>
                              <button className="score-control-confirm-ball-btns">
                                START NEXT OVER
                              </button>
                            </div>
                            <div onClick={onNoClick}>
                              <button className="score-control-conformation-close-btn">
                                CONTINUE THIS OVER
                              </button>
                            </div>
                          </div>

                          {/* <div className="over-modal-actions">
                                          <Button
                                              className="over-modal-start-btn"
                                              onClick={onYesClick}
                                          >
                                              START NEXT OVER
                                          </Button>
                                          <Button
                                              className="over-modal-continue-btn"
                                              onClick={onNoClick}
                                          >
                                              CONTINUE THIS OVER
                                          </Button>
                                      </div> */}
                        </div>
                      </>
                    ) : showPlayerModal ? (
                      <div className="col-12">
                        <SelectPlayerControls
                          isOpen={isOpen}
                          toggle={toggle}
                          playerList={playerList}
                          selectPlayer={selectPlayer}
                          isBowler={isBowler}
                        />
                      </div>
                    ) : cricketFieldIsOpen ? (
                      <div className="col-12">
                        <CricketFieldControls
                          cricketFieldData={cricketFieldData}
                          shotTypes={shotTypes}
                          isShotType={isShotType}
                          handleShotTypeToggle={handleShotTypeToggle}
                          toggle={cricketFieldToggle}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="col" onClick={onUndoClick}>
                          <button className="score-control-ball-types-btns">
                            Undo
                          </button>
                        </div>
                        <div className="col">
                          <button className="score-control-ball-types-btns">
                            Remark
                          </button>
                        </div>
                        <div
                          className="col"
                          onClick={() => updateExtras(BALL_BYE)}
                        >
                          <button className="score-control-ball-types-btns">
                            Bye
                          </button>
                        </div>
                        <div
                          className="col"
                          onClick={() => updateExtras(BALL_LEG_BYE)}
                        >
                          <button className="score-control-ball-types-btns">
                            Leg bye
                          </button>
                        </div>
                        <div
                          className="col"
                          onClick={() => updateExtras(NO_BALL)}
                        >
                          <button className="score-control-ball-types-btns">
                            No Ball
                          </button>
                        </div>
                        <div className="col">
                          <button
                            onClick={() => updateExtras(BALL_WIDE)}
                            className="score-control-ball-types-btns"
                          >
                            Wide
                          </button>
                        </div>
                        <div onClick={() => setActionPopup(true)}>
                          <button className="score-control-action-ball-btns">
                            Action
                          </button>
                        </div>
                        <div className="col">
                          <button
                            onClick={onWicketClick}
                            className="score-control-wicket-ball-btns"
                          >
                            Wicket
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={`row row-cols-2 g-2 col-6 ${
                        isLoading ||
                        actionPopup ||
                        showWicketModal ||
                        showChangeOverModal ||
                        showPlayerModal
                          ? " disable-button"
                          : ""
                      }`}
                      style={{ width: "50%" }}
                    >
                      <div className="col">
                        <button
                          onClick={() => handleRuns(6, 1)}
                          className="score-control-ball-btn"
                        >
                          6
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => handleRuns(0, 1)}
                          className="score-control-ball-btn"
                        >
                          0
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => handleRuns(4, 1)}
                          className="score-control-ball-btn"
                        >
                          4
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => handleRuns(1, 1)}
                          className="score-control-ball-btn"
                        >
                          1
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => handleRuns(2, 1)}
                          className="score-control-ball-btn"
                        >
                          2
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => handleRuns(3, 1)}
                          className="score-control-ball-btn"
                        >
                          3
                        </button>
                      </div>
                      <div className="col-12">
                        <button
                          onClick={() =>
                            updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS)
                          }
                          className="score-control-ball-types-btns"
                        >
                          {/* <img
                        className="button-icon"
                        src="icons/b.png"
                        alt="Icon"
                      /> */}
                          Ball Start
                        </button>
                      </div>
                    </div>
                    <div className="vertical-line my-2"></div>
                    <div className="row row-cols-2 g-2 col-6">
                      <div className="col" onClick={onUndoClick}>
                        <button className="score-control-ball-types-btns">
                          Undo
                        </button>
                      </div>
                      <div className="col">
                        <button className="score-control-ball-types-btns">
                          Remark
                        </button>
                      </div>
                      <div
                        className="col"
                        onClick={() => updateExtras(BALL_BYE)}
                      >
                        <button className="score-control-ball-types-btns">
                          Bye
                        </button>
                      </div>
                      <div
                        className="col"
                        onClick={() => updateExtras(BALL_LEG_BYE)}
                      >
                        <button className="score-control-ball-types-btns">
                          Leg bye
                        </button>
                      </div>
                      <div
                        className="col"
                        onClick={() => updateExtras(NO_BALL)}
                      >
                        <button className="score-control-ball-types-btns">
                          No Ball
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={() => updateExtras(BALL_WIDE)}
                          className="score-control-ball-types-btns"
                        >
                          Wide
                        </button>
                      </div>
                      <div onClick={() => setActionPopup(true)}>
                        <button className="score-control-action-ball-btns">
                          Action
                        </button>
                      </div>
                      <div className="col">
                        <button
                          onClick={onWicketClick}
                          className="score-control-wicket-ball-btns"
                        >
                          Wicket
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} md={5} lg={5}>
          {/* Overs Details */}
          <div className="col">
            <div className="score-right-side-header px-auto">
              <p className="m-0">DSL - Max Overs - {matchData.maxOvers}</p>
            </div>
          </div>
          <CommentaryRightPanel
            refId={refId}
            overBalls={overBalls}
            partnerships={filteredPartnerships}
            teamDetails={teamDetails}
            overHistory={overHistory}
            players={players}
            currentOver={currentOver}
          />
          {/* <RevertModal
            isOpen={showRevertModal}
            toggle={() => setShowRevertModal(false)}
            onYesClick={() => {
              handleRevertToToss();
              setShowRevertModal(false);
            }}
            onNoClick={() => setShowRevertModal(false)}
          /> */}
        </Col>
      </Row>
    </div>
  );
};

export default NewCommentaryScreen;
