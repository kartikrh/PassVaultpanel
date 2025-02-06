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
import ChangeOverControls from "./CommentryRightControls/ChangeOverControls";
import { IoChevronBackOutline } from "react-icons/io5";
import { Avatar } from "@mui/material";

const CenteredBadge = styled.div`
  position: absolute;
  background: linear-gradient(180deg, #3E119E -19.7%, #35127D 125.76%);
  box-shadow: 
  0px 1px 5px 0px #180C40,
  0px 5.72px 5.72px 0px #574CD2 inset,
  0px -5.72px 5.72px 0px #281694 inset;
  color: #ffffff;
  padding: 6px 34px 6px;
  top: -12px;
  right: 50%;
  font-size: 12px;
  transform: translateX(50%);
  border-radius: 0px 0px 55% 55% / 0px 0px 30px 30px;
  z-index: 5;

  body[data-theme="dark"] & {
    box-shadow: 
      0px 1px 5px 0px #180C40,
      0px 5.72px 5.72px 0px #574CD2 inset,
      0px -5.72px 5.72px 0px #281694 inset;
  }
`;

const Background = styled.div`
  position: absolute;
  top: -12px;
  right: 50%;
  width: 123px;
  height: 12px;
  background: linear-gradient(180deg, #3E119E -19.7%, #35127D 125.76%);
  box-shadow: 
    0px 1px 5px 0px #180C40,
    0px 5.72px 5.72px 0px #574CD2 inset,
    0px -5.72px 5.72px 0px #281694 inset;
  transform: translateX(50%);
`;

const CenteredBadgeBowler = styled.div`
  position: absolute;
  // background: #00b400;
  color: #ffffff;
  padding: 6px 31px 6px;
  top: -12px;
  right: 50%;
  font-size: 12px;
  transform: translateX(50%);
  border-radius: 0px 0px 55% 55% / 0px 0px 30px 30px;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
  background: linear-gradient(180deg, #119E11 -19.7%, #127D12 125.76%);
  box-shadow: 
    0px 1px 5px 0px #0C400C,
    0px 5.72px 5.72px 0px #4CD24C inset,
    0px -5.72px 5.72px 0px #169416 inset;
    
`;

const BackgroundBowler = styled.div`
  position: absolute;
  top: -12px;
  right: 50%;
  width: 123px;
  height: 12px;
  background: linear-gradient(180deg, #119E11 -19.7%, #127D12 125.76%);
  box-shadow: 
    0px 1px 5px 0px #0C400C,
    0px 5.72px 5.72px 0px #4CD24C inset,
    0px -5.72px 5.72px 0px #169416 inset;
    transform: translateX(50%);
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
  const defaultValue = extraType === BALL_WIDE || extraType === NO_BALL ? 0 : 1;
  const [isBoundary, setIsBoundary] = useState(undefined);
  const dispatch = useDispatch();

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
              case '0':
                  handleRuns(0, 1);
                  break;
              case '1':
                  handleRuns(1, 1);
                  break;
              case '2':
                  handleRuns(2, 1);
                  break;
              case '-':
                  onUndoClick();
                  break;
              case '3':
                  handleRuns(3, 1);
                  break;
              case '4':
                  handleRuns(4, 1, true);
                  break;
              case '6':
                  handleRuns(6, 1, true);
                  break;
              // case '/':
              //     updateExtras(BALL_WIDE)
              //     break;
              // case '*':
              //     updateExtras(NO_BALL);
              //     break;
              case '+':
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
      }
  const handleRuns = (run, ball, isBoundary = false) => {
      updateRuns(
          {
              run: run,
              ball: ball,
              batter: onPitchPlayers[ON_STRIKE],
              bowler: onPitchPlayers[CURRENT_BOWLER],
              isBoundary
          }
      )
  }

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

  useEffect(() => {
    if (extrasTypeIsOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById("runs");
        if (inputElement) inputElement.focus();
      }, 150);
    }
  }, [extrasTypeIsOpen]);

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
      toggle()
      PenaltyIsOpen && PenaltyToggle();
    retiredHurtisOpen && retiredHurttoggle();
    inningsChangeisOpen && inningsChangetoggle()
    extrasTypeIsOpen && extrasTypeToggle();
    actionPopup && setActionPopup(false);
    showChangeOverModal && setActionPopup(false);
    showRunsPopup && setShowRunsPopup(false);
    cricketFieldIsOpen && cricketFieldToggle();
    showRevertModal && setShowRevertModal(false)
  };

  const isButtonDisabled = isLoading || actionPopup || showWicketModal || showChangeOverModal || showPlayerModal;

  const ButtonColumn = ({
    label,
    onClick,
    className=`score-control-ball-types-btns ${isButtonDisabled ? " disable-button" : ""}`,
  }) => (
    <div className="col" onClick={onClick}>
      <button className={className}>{label}</button>
    </div>
  );
  const RunButton = ({ label, onClick, className }) => (
    <div className="col">
      <button onClick={onClick} className={className}>
        {label}
      </button>
    </div>
  );

  // For handling action popups (Change innings, revert, retired hurt, etc.)
  const renderActionPopups = () => {
    if (inningsChangeisOpen) {
      return (
        <ChangeInningsControls
          isOpen={true}
          toggle={inningsChangetoggle}
          onNoClick={() => {inningsChangeNoClick(); setActionPopup(false)}}
          onYesClick={() => {inningsChangeYesClick(); setActionPopup(false)}}
        />
      );
    }
    if (showRevertModal) {
      return (
        <RevertControls
          isOpen={showRevertModal}
          toggle={() => setShowRevertModal(false)}
          onYesClick={() => {
            handleRevertToToss();
            setShowRevertModal(false);
            setActionPopup(false)
          }}
          onNoClick={() => setShowRevertModal(false)}
        />
      );
    }
    if (retiredHurtisOpen) {
      return (
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
      );
    }
    if (showRunsPopup) {
      return (
        <RunsControls
          toggle={() => {setShowRunsPopup(false); setActionPopup(false)}}
          onSubmitClick={(runs) => handleRuns(runs, 1)}
        />
      );
    }
    if (PenaltyIsOpen) {
      return (
        <PenaltyControls
          toggle={() => {PenaltyToggle(); setActionPopup(false)}}
          isOpen={PenaltyIsOpen}
          selectedPenalty={PenaltySelectedPenalty}
        />
      );
    }

    return <div className="col-8 row row-cols-2">{renderActionButtons()}</div>;
  };

  // Render action buttons for normal flow
  const renderActionButtons = () => (
    <>
      <ActionButton label="5" onClick={() => setShowRunsPopup(true)} />
      <ActionButton label="Penalty" onClick={() => showPaneltyRuns(true)} />
      <ActionButton label="NB B" onClick={() => {updateExtras(NO_BALL_BYE); setActionPopup(false)}} />
      <ActionButton
        label="NB LB"
        onClick={() => {updateExtras(NO_BALL_LEG_BYE); setActionPopup(false)}}
      />
      <ActionButton label="End Over" onClick={() => {changeOver(); setActionPopup(false)}} />
      <ActionButton label="End inn." onClick={() => {endInnings()}} />
      <ActionButton label="R. Hurt" onClick={() => {handleRetiredHurt()}} />
      <ActionButton
        label="R. to Toss"
        onClick={() => setShowRevertModal(true)}
      />
    </>
  );

  // A reusable ActionButton component
  const ActionButton = ({ label, onClick }) => (
    <div className="col my-1" onClick={onClick}>
      <button className="score-control-action-btns">{label}</button>
    </div>
  );

  // Render default controls (Undo, Remark, Bye, etc.)
  const renderDefaultControls = () => (
    <>
      <ActionButton label="Undo" onClick={onUndoClick} />
      <ActionButton label="Remark" />
      <ActionButton label="Bye" onClick={() => updateExtras(BALL_BYE)} />
      <ActionButton
        label="Leg bye"
        onClick={() => updateExtras(BALL_LEG_BYE)}
      />
      <ActionButton label="No Ball" onClick={() => updateExtras(NO_BALL)} />
      <ActionButton label="Wide" onClick={() => updateExtras(BALL_WIDE)} />
      <ActionButton label="Action" onClick={() => setActionPopup(true)} />
      <ActionButton label="Wicket" onClick={onWicketClick} />
    </>
  );

  return (
    <div className="container-fluid text-white py-4">
      {/* Score Section */}
      <Row>
        <Col xs={12} md={7} lg={7}>
          <div className="d-md-flex gap-3 my-1 mb-3">
            <div className="position-relative w-100 max-w-md px-4 py-2 rounded score-card">
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
              <div className="d-flex justify-content-between align-items-center mb-2 fs-5">
                <div
                  className="fw-medium"
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
                    &nbsp;({teamDetails?.[BATTING_TEAM]?.teamOver || 0})
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="player-image me-2"><img height={25} src={onPitchPlayers[ON_STRIKE]?.playerimage} className="overflow-hidden"/></div>
                    <span
                      className={`fw-medium scorecard-striker-player-name`}
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
                      className="score-player-change-btn mx-2"
                      // style={{
                      //   backgroundColor: teamDetails?.[BATTING_TEAM].backgroundColor,
                      //   color: "#ffffff",
                      // }}
                    >
                      C
                    </button>
                  </div>
                  <div className={`scorecard-striker-player-name`}>
                    {onPitchPlayers[ON_STRIKE]?.batRun || 0} (
                    {onPitchPlayers[ON_STRIKE]?.batBall || 0})
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 text-secondary">
                  <div className="d-flex align-items-center">
                  <div className="player-image me-2"><img height={25} src={onPitchPlayers[NON_STRIKE]?.playerimage} className="overflow-hidden"/></div>
                    <span
                      className={`fw-small scorecard-nonstriker-player-name`}
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
                      className="score-player-change-btn mx-2"
                      style={{
                        backgroundColor:
                          teamDetails?.[BATTING_TEAM].backgroundColor,
                        color: "#ffffff",
                      }}
                    >
                      C
                    </button>
                  </div>
                  <div className={`scorecard-nonstriker-player-name`}>
                    {onPitchPlayers[NON_STRIKE]?.batRun || 0} (
                    {onPitchPlayers[NON_STRIKE]?.batBall || 0})
                  </div>
                </div>
              </div>
            </div>

            <div className="position-relative w-100 max-w-md px-4 py-2 rounded score-card mt-4 mt-md-0">
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
              <div className="d-flex justify-content-between align-items-center mb-2 fs-5">
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
                    &nbsp;({teamDetails?.[BOWLING_TEAM]?.teamOver || 0})
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                  <div className="player-image me-2"><img height={25} src={onPitchPlayers[CURRENT_BOWLER]?.playerimage} className="overflow-hidden"/></div>
                    <span className={`fw-medium scorecard-striker-player-name`}>
                      {onPitchPlayers[CURRENT_BOWLER]?.playerName} &nbsp;
                    </span>
                    <button
                      onClick={() => {
                        changePlayer(CURRENT_BOWLER);
                      }}
                      className="score-player-change-btn"
                    >
                      C
                    </button>
                  </div>
                  <div className={`scorecard-striker-player-name`}>
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
                    cricketFieldIsOpen) && (
                    <button
                      className="control-center-back-btn me-2"
                      onClick={check}
                    >
                      <IoChevronBackOutline />
                      {/* <img
                        role="button"
                        className="back-icon"
                        // onClick={() => setStatusPopup(true)}
                        src="icons/back.png"
                        alt="Icon"
                        style={{ color: "black" }}
                        // height="10px"
                      /> */}
                    </button>
                  )}
                  {showChangeOverModal ? "Over Complete" : cricketFieldIsOpen ? `Ball : ${cricketFieldData?.overCount} ${cricketFieldData?.bowler} to ${cricketFieldData?.batter}` : "Control Centre"}
                </h5>
                {(!showChangeOverModal && !cricketFieldIsOpen) ? (
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
                ) : cricketFieldIsOpen ? (
                  <div className="d-flex align-items-center PY-2">
                  <span>Tracking a selection shot type</span>
                  <Switch
                    width={70}
                    uncheckedIcon={<OffsymbolStatus />}
                    checkedIcon={<OnSymbolStatus />}
                    className="pe-0 mx-2"
                    onColor="#02a499"
                    onChange={() => {
                      handleShotTypeToggle(!isShotType);
                    }}
                    checked={isShotType}
                  />
                </div>
                ) : null}
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
                        {renderActionPopups()}
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
                      <ChangeOverControls
                        stats={stats}
                        battingTeam={battingTeam}
                        bowlerName={bowlerName}
                        currentOver={currentOver}
                        currentOverBalls={currentOverBalls}
                        onYesClick={onYesClick}
                        onNoClick={onNoClick}
                        onPitchPlayers={onPitchPlayers}
                      />
                    ) : showPlayerModal ? (
                      <SelectPlayerControls
                        isOpen={isOpen}
                        toggle={toggle}
                        playerList={playerList}
                        selectPlayer={selectPlayer}
                        isBowler={isBowler}
                      />
                    ) : cricketFieldIsOpen ? (
                      <CricketFieldControls
                        cricketFieldData={cricketFieldData}
                        shotTypes={shotTypes}
                        isShotType={isShotType}
                        handleShotTypeToggle={handleShotTypeToggle}
                        toggle={cricketFieldToggle}
                      />
                    ) : (
                      renderDefaultControls()
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={`row row-cols-2 g-2 col-6 ${
                        isButtonDisabled
                          ? " disable-button"
                          : ""
                      }`}
                      style={{ width: "50%" }}
                    >
                      {["6", "0", "4", "1", "2", "3"].map((runs) => (
                        <RunButton
                          key={runs}
                          label={runs}
                          onClick={() => handleRuns(Number(runs), 1)}
                          className="score-control-ball-btn"
                        />
                      ))}
                      <div className="col-12">
                        <button
                          onClick={() =>
                            updateDisplayStatus(BOWLER_CHANGE_DISPLAY_STATUS)
                          }
                          className="score-control-ball-types-btns"
                        >
                          Ball Start
                        </button>
                      </div>
                    </div>
                    <div className="vertical-line my-2"></div>
                    <div className="row row-cols-2 g-2 col-6">
                      <ButtonColumn label="Undo" onClick={onUndoClick} />
                      <ButtonColumn label="Remark" onClick={() => {}} />
                      <ButtonColumn
                        label="Bye"
                        onClick={() => updateExtras(BALL_BYE)}
                      />
                      <ButtonColumn
                        label="Leg bye"
                        onClick={() => updateExtras(BALL_LEG_BYE)}
                      />
                      <ButtonColumn
                        label="No Ball"
                        onClick={() => updateExtras(NO_BALL)}
                      />
                      <ButtonColumn
                        label="Wide"
                        onClick={() => updateExtras(BALL_WIDE)}
                      />
                      <ButtonColumn 
                        label="Action"
                        onClick={() => setActionPopup(true)}
                        className={`score-control-action-ball-btns ${isButtonDisabled ? " disable-button" : ""}`}
                      />
                      <ButtonColumn
                        label="Wicket"
                        onClick={onWicketClick}
                        className={`score-control-wicket-ball-btns ${isButtonDisabled ? " disable-button" : ""}`}
                      />
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
