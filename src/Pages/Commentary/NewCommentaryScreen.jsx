import React, { useState, useEffect } from "react";
import { Button, Col, Row } from "reactstrap";
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

const CenteredBadge = styled.div`
  position: absolute;
  background: ${(props) => props.bgColor || "blue"};
  padding: 2px 26px;
  top: -6px;
  right: 50%;
  font-size: 10px;
  transform: translateX(50%);
  border-radius: 0px 0px 60px 60px;
`;

const ActionButton = styled.button`
  background-color: #2c2c3e;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  font-size: 18px;
  display: flex;
  padding: 14px 0px;
  justify-content: center;
  align-items: center;
  border: none; /* Optional if you want to remove default border */
  cursor: pointer;
  color: ${(props) => props.color || "#fff"};

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 14px 0px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px 0px;
  }
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
  bowlingTeam,
  bowlingTeamDetails,
  toggle,
  isOpen,
  onSubmit,
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
}) => {
  console.log("retiredHurttoggle", retiredHurttoggle);

  const [changePlayerType, setChangePlayerType] = useState(false);
  console.log("change", changePlayerType)
  const [trackingBall, setTrackingBall] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionPopup, setActionPopup] = useState(undefined);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.layout.panelTheme);
  const [currentStep, setCurrentStep] = useState(1);
  const [wicketData, setWicketData] = useState({
    wicketType: null,
    batterId: null,
    runs: "0",
    fielder1: null,
    fielder2: null,
  });
  const [showFields, setShowFields] = useState({
    batterId: false,
    runs: false,
    fielder1: false,
    fielder2: false,
  });
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

  const scoreData = {
    batting: {
      team: "England",
      players: [
        {
          name: "Tim Robinson",
          runs: 10,
          balls: 8,
          active: true,
        },
        {
          name: "Glenn Phillips",
          runs: 1,
          balls: 3,
          active: false,
        },
      ],
    },
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

  // console.log("wicketData", wicketData);

  const handleChange = (field, value) => {
    const newWicketData = { ...wicketData, [field]: value };

    if (field === "wicketType") {
      const newShowFields = {
        batterId: false,
        runs: false,
        fielder1: false,
        fielder2: false,
      };

      switch (value) {
        case BOLD:
        case LBW:
        case HIT_WICKET:
        case HIT_BALL_TWICE:
          newWicketData.batterId =
            onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId;
          break;

        case RETIRED_OUT:
        case OBSTRACT_THE_FIELDING:
        case TIMED_OUT:
          newShowFields.batterId = true;
          newShowFields.runs = true;
          break;

        case RUN_OUT:
          newShowFields.batterId = true;
          newShowFields.runs = true;
          newShowFields.fielder1 = true;
          newShowFields.fielder2 = true;
          break;

        case CATCH:
        case STUMP:
          newShowFields.fielder1 = true;
          newWicketData.batterId =
            onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId;
          if (value === STUMP) {
            newWicketData.fielder1 =
              bowlingTeamDetails?.commentaryPlayerTeamKipper;
          }
          break;

        default:
          break;
      }

      setShowFields(newShowFields);
    }

    setWicketData(newWicketData);
  };

  const getOutBatsman = () => {
    const player = !wicketData.batterId
      ? onPitchPlayers[ON_STRIKE]
      : wicketData.batterId === onPitchPlayers[ON_STRIKE]?.commentaryPlayerId
      ? onPitchPlayers[ON_STRIKE]
      : onPitchPlayers[NON_STRIKE];

    // Add extra runs to player stats if available
    if (player && extraType) {
      return {
        ...player,
        batRun: (player.batRun || 0) + parseInt(wicketData.runs || 0),
        // Add other extra calculations as needed
      };
    }
    return player;
  };

  const handleNext = () => {
    if (!wicketData.wicketType) {
      dispatch(
        updateToastData({
          data: "Please select a wicket type",
          title: "Required Error",
          type: "ERROR",
        })
      );
      return;
    }

    setCurrentStep(2);
  };

  const handleWicketNext = () => {
    const fieldsToCheck = { ...showFields };
    if (wicketData.wicketType === RUN_OUT) {
      fieldsToCheck.fielder2 = false;
    }

    const missingFields = Object.keys(fieldsToCheck).filter(
      (field) => fieldsToCheck[field] && !wicketData[field]
    );

    if (missingFields.length > 0) {
      dispatch(
        updateToastData({
          data: `Please fill: ${missingFields.join(", ")}`,
          title: "Required Error",
          type: "ERROR",
        })
      );
      return;
    }
    setCurrentStep(3);
    setShowFields({
      batterId: false,
      runs: false,
      fielder1: false,
      fielder2: false,
    });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    const outPlayer = getOutBatsman();

    const finalData = {
      wicketType: wicketData.wicketType,
      batterId: outPlayer?.commentaryPlayerId,
      runs: showFields.runs ? parseInt(wicketData.runs) : 0,
      fielder1: showFields.fielder1
        ? wicketData.fielder1
        : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
      fielder2: showFields.fielder2
        ? wicketData.fielder2
        : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
      isExtraWicket: !!extraType,
    };

    onSubmit(finalData);
  };

  const getWicketTypeLabel = () => {
    const wicketTypeObj = [...WICKET_TYPE_LIST, ...EXTRAS_WICKET_TYPE].find(
      (w) => w.value === wicketData.wicketType
    );
    return wicketTypeObj?.label || "";
  };

  const renderPlayerCard = (player, type) => {
    if (!player) return null;

    if (type === "bowler") {
      const isWicketCountable = !LIST_TO_EXCLUDE_WICKET_FOR_BOWLER.includes(
        wicketData.wicketType
      );
      const updatedWickets = isWicketCountable
        ? (player.bowlerTotalWicket || 0) + 1
        : player.bowlerTotalWicket || 0;

      const totalBalls =
        (player.bowlerTotalBall || 0) + (!wicketData.isExtraWicket ? 1 : 0);
      const totalOvers = Math.floor(totalBalls / 6);
      const remainingBalls = totalBalls % 6;
      const currentOver = `${totalOvers}.${remainingBalls}`;

      // Calculate economy
      const totalRuns = player.bowlerRun || 0;
      const economy =
        totalOvers > 0 ? (totalRuns / totalOvers).toFixed(2) : "0.00";
      return (
        <>
          <div className="wicket-modal-player-stats my-4">
            <div className="px-3">
              <div className="wicket-modal-player-row wicket-modal-header-row">
                Bowler
              </div>
              <div className="">{player.playerName}</div>
            </div>
            <div className="wicket-modal-player-row wicket-modal-header-row">
              {/* <div className="wicket-modal-player-name">Bowler</div> */}
              <div className="wicket-modal-player-stat">O</div>
              <div className="wicket-modal-player-stat">W</div>
              <div className="wicket-modal-player-stat">R</div>
              <div className="wicket-modal-player-stat">Eco</div>
              <div className="wicket-modal-player-stat">M</div>
              <div className="wicket-modal-player-stat">Wides</div>
              <div className="wicket-modal-player-stat">NoB</div>
              <div className="wicket-modal-player-stat">Dots</div>
            </div>
            <div className="wicket-modal-player-row">
              {/* <div className="wicket-modal-player-name">
                {player.playerName}
              </div> */}
              <div className="wicket-modal-player-stat">{currentOver}</div>
              <div className="wicket-modal-player-stat">{updatedWickets}</div>
              <div className="wicket-modal-player-stat">{totalRuns}</div>
              <div className="wicket-modal-player-stat">{economy}</div>
              <div className="wicket-modal-player-stat">
                {player.bowlerMaidenOver || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {player.bowlerWideBall || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {player.bowlerNoBall || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {player.bowlerDotBall || 0}
              </div>
            </div>
          </div>
        </>
      );
    }
    if (type === "batsman") {
      const isStrikerOut =
        wicketData.batterId === onPitchPlayers[ON_STRIKE]?.commentaryPlayerId;
      // Add runs only if striker is out and there are runs
      const updatedRuns =
        isStrikerOut && showFields.runs
          ? (player.batRun || 0) + parseInt(wicketData.runs || 0)
          : player.batRun || 0;

      // Update balls - add 1 ball if not extra wicket and if it's run out, add ball only to striker
      const updatedBalls =
        (player.batBall || 0) +
        (!wicketData.isExtraWicket && isStrikerOut ? 1 : 0);

      // Calculate updated strike rate
      const updatedStrikeRate =
        updatedBalls > 0
          ? ((updatedRuns / updatedBalls) * 100).toFixed(2)
          : "0.00";

      // Get fielder names from bowlingTeam list
      const getFielderName = (fielderId) => {
        const fielder = bowlingTeam?.find(
          (p) => p.commentaryPlayerId === fielderId
        );
        return fielder?.playerName || "";
      };

      // Get wicket type label
      const getWicketTypeLabel = () => {
        const wicketTypeObj = [...WICKET_TYPE_LIST, ...EXTRAS_WICKET_TYPE].find(
          (w) => w.value === wicketData.wicketType
        );
        return wicketTypeObj?.label || "";
      };

      return (
        <>
          {/* <h3>Batsman Details</h3> */}
          <div className="wicket-modal-player-stats">
            <div className="px-3">
              <div className="wicket-modal-player-row wicket-modal-header-row">
                Batsman
              </div>
              <div className="">{player.playerName}</div>
            </div>
            <div className="wicket-modal-player-row wicket-modal-header-row">
              {/* <div className="wicket-modal-player-name">Batter</div> */}
              <div className="wicket-modal-player-stat">R</div>
              <div className="wicket-modal-player-stat">B</div>
              <div className="wicket-modal-player-stat">SR</div>
              <div className="wicket-modal-player-stat">4s</div>
              <div className="wicket-modal-player-stat">6s</div>
              <div className="wicket-modal-player-stat">Dots</div>
              <div className="wicket-modal-player-stat">Extras</div>
              <div className="wicket-modal-player-stat">Wicket</div>
            </div>
            <div className="wicket-modal-player-row">
              {/* <div className="wicket-modal-player-name">
                {player.playerName}
              </div> */}
              <div className="wicket-modal-player-stat">{updatedRuns}</div>
              <div className="wicket-modal-player-stat">{updatedBalls}</div>
              <div className="wicket-modal-player-stat">
                {updatedStrikeRate}
              </div>
              <div className="wicket-modal-player-stat">
                {player.batFour || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {player.batSix || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {player.batDotBall || 0}
              </div>
              <div className="wicket-modal-player-stat">
                {(player.wideRuns || 0) +
                  (player.noBallRuns || 0) +
                  (player.byeRuns || 0) +
                  (player.legByeRuns || 0)}
              </div>
              <div className="wicket-modal-player-stat">
                {getWicketTypeLabel()}
              </div>
            </div>
          </div>
        </>
      );
    }
  };
  useEffect(() => {
    setBowlingPlayerList(
      bowlingTeam?.map((player) => ({
        label: player.playerName,
        value: player.commentaryPlayerId,
      })) || []
    );
  }, [bowlingTeam]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setWicketData({
        wicketType: null,
        batterId: null,
        runs: "0",
        fielder1: null,
        fielder2: null,
      });
      setShowFields({
        batterId: false,
        runs: false,
        fielder1: false,
        fielder2: false,
      });
    }
  }, [isOpen]);

  // console.log("currentStep", currentStep);
  // console.log("extraType", extraType);
  // console.log("showFields", showFields);
  // console.log("wicketData", wicketData);

  const allFalse = Object.values(showFields).every((value) => value === false);

  // extra component

  const defaultValue = extraType === BALL_WIDE || extraType === NO_BALL ? 0 : 1;
  const [run, setRun] = useState(defaultValue);
  const [isBoundary, setIsBoundary] = useState(undefined);
  const extraTypehandleSubmit = (type) => {
    const objToSend = {
      run: +run,
      type,
      isBoundary: +run === 4 || +run === 6 ? isBoundary : false,
    };
    updateExtrasExtrasType(objToSend);
  };
  const extraTypehandleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) toggle();
    else if (e.key === "Enter") extraTypehandleSubmit(EXTRAS);
  };
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
  const onSubmitClick = (newPlayerId) => {
    console.log("newPlayerId", newPlayerId)
    const oldPlayer = onPitchplayers[changePlayerType];
    let toSend = {
      ...onPitchplayers,
      [RETIRED_HURT_BATTER]: { ...oldPlayer, isPlay: null, onStrike: null },
      [PREV_ON_STRIKE]: onPitchplayers[ON_STRIKE],
      [PREV_NON_STRIKE]: onPitchplayers[NON_STRIKE],
    };
    toSend[PLAYER_LIST] = allBattingPlayers.map((player) => {
      let updatedPlayer = player;
      console.log("updatedPlayer", updatedPlayer)
      if (player?.commentaryPlayerId === newPlayerId) {
        updatedPlayer = {
          ...player,
          isPlay: true,
          onStrike: changePlayerType === ON_STRIKE ? true : null,
        };
        toSend[changePlayerType] = updatedPlayer;
      }
      if (player?.commentaryPlayerId === oldPlayer?.commentaryPlayerId) {
        updatedPlayer = toSend[RETIRED_HURT_BATTER];
      }
      return updatedPlayer;
    });
    setChangePlayerType(null);
    console.log("sdafsd",{ toSend });
    retiredHurtonsubmit(toSend);
  };
  // retired hut

  return (
    <div className="container-fluid text-white py-4">
      {/* Score Section */}
      <Row>
        <Col xs={12} md={7} lg={7}>
          <div className="d-md-flex gap-1 my-1">
            <div className="col-12 col-md-6 bg-dark text-white rounded p-2 position-relative">
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
                <div className="d-flex justify-content-between align-items-center mb-2 text-white">
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
                      className="change-button text-right text-white"
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
                      className="change-button text-right text-white"
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
            <div className="col-12 col-md-6 bg-dark text-white rounded p-2  position-relative">
              <CenteredBadge
                bgColor={teamDetails?.[BOWLING_TEAM].backgroundColor}
              >
                BOWLING
              </CenteredBadge>
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
                      className="change-button text-right text-white"
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
                <h5 className="card-title">Control Centre</h5>
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
              </div>

              {/* Number Pad */}
              <div className="d-flex justify-content-center m-0 p-0 w-100 g-1">
                {actionPopup || showWicketModal || extrasTypeIsOpen ? (
                  <div
                    className={`row row-cols-2 g-2 col-12${
                      isLoading ? "disable-button" : ""
                    }`}
                  >
                    {actionPopup ? (
                      <>
                        {inningsChangeisOpen ? (
                          <div className="col-8 d-flex flex-column m-0 p-0">
                            <div>
                              <div>Change Innings</div>
                              <div>Do you want to end the current innings?</div>
                            </div>
                            <div className="d-flex gap-2 mt-auto">
                              <div
                                className="col-6"
                                onClick={inningsChangeYesClick}
                              >
                                <button className="score-control-confirm-ball-btns">
                                  Yes
                                </button>
                              </div>
                              <div
                                className="col-6"
                                onClick={inningsChangeNoClick}
                              >
                                <button className="score-control-conformation-close-btn">
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : showRevertModal ? (
                          <div className="col-8 d-flex flex-column m-0 p-0">
                            <div>
                              <div>Revert to Toss</div>
                              <div>
                                Are you sure you want to revert the toss? This
                                action will remove all related data.
                              </div>
                            </div>
                            <div className="d-flex gap-2 mt-auto">
                              <div
                                className="col-6"
                                onClick={() => {
                                  handleRevertToToss();
                                  setShowRevertModal(false);
                                }}
                              >
                                <button className="score-control-confirm-ball-btns">
                                  Yes
                                </button>
                              </div>
                              <div
                                className="col-6"
                                onClick={() => setShowRevertModal(false)}
                              >
                                <button className="score-control-conformation-close-btn">
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : retiredHurtisOpen ? (
                          <div className="col-12 d-flex flex-column m-0 p-0">
                            {!changePlayerType && <div className="col-6">
                              <div>Retired Hurt</div>
                              <div>Please select a batter:</div>
                              <div
                                className="col my-4"
                                onClick={() => setChangePlayerType(ON_STRIKE)}
                              >
                                <button
                                  className={`score-control-wicket-ball-btns ${
                                    changePlayerType == ON_STRIKE ? "active" : ""
                                  }`}
                                >
                                  {onPitchPlayers?.[ON_STRIKE]?.playerName}
                                </button>
                              </div>
                              <div
                                className="col my-4"
                                onClick={() => setChangePlayerType(NON_STRIKE)}
                              >
                                <button
                                  className={`score-control-wicket-ball-btns ${
                                    changePlayerType == ON_STRIKE ? "active" : ""
                                  }`}
                                >
                                  {onPitchPlayers?.[NON_STRIKE]?.playerName}
                                </button>
                              </div>
                              <div
                                className="col-6"
                                onClick={() => retiredHurttoggle()}
                              >
                                <button className="score-control-conformation-close-btn">
                                  Close
                                </button>
                              </div>
                            </div>}
                            {changePlayerType && (
                              <SelectPlayerControls
                                isOpen={true}
                                toggle={() => {
                                  setChangePlayerType(null);
                                  setActionPopup(false)
                                }}
                                playerList={retiredHurtplayerList}
                                selectPlayer={onSubmitClick}

                              />
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="col">
                              <button className="score-control-action-btns">
                                5
                              </button>
                            </div>
                            <div
                              className="col"
                              onClick={() => {
                                setActionPopup(false);
                                showPaneltyRuns(true);
                              }}
                            >
                              <button className="score-control-action-btns">
                                Penalty
                              </button>
                            </div>
                            <div
                              className="col"
                              onClick={() => updateExtras(NO_BALL_BYE)}
                            >
                              <button className="score-control-action-btns">
                                NB B
                              </button>
                            </div>
                            <div
                              className="col"
                              onClick={() => updateExtras(NO_BALL_LEG_BYE)}
                            >
                              <button className="score-control-action-btns">
                                NB LB
                              </button>
                            </div>
                            <div
                              className="col"
                              onClick={() => {
                                changeOver();
                                // setActionPopup(false);
                              }}
                            >
                              <button className="score-control-action-btns">
                                End Over
                              </button>
                            </div>
                            <div
                              className="col"
                              onClick={() => {
                                endInnings();
                              }}
                            >
                              <button className="score-control-action-btns">
                                End inn.
                              </button>
                            </div>
                            <div
                              className="col"
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
                              className="col"
                              onClick={() => setShowRevertModal(true)}
                            >
                              <button className="score-control-action-btns">
                                R. to Toss
                              </button>
                            </div>
                            <div className="col-12">
                              <button
                                onClick={() => setActionPopup(false)}
                                className="score-control-close-btn"
                              >
                                Close
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    ) : extrasTypeIsOpen ? (
                      <div className="col-12">
                        <div className="col-8">
                          <button className="score-control-ball-types-btns active">
                            {extraType?.type || extraType}
                          </button>
                        </div>
                        <div className="my-4 col-12">
                          <>
                            {
                              <input
                                className="form-control"
                                type="number"
                                value={run}
                                id={"runs"}
                                onChange={(e) => setRun(e.target.value)}
                                min={0}
                                max={99}
                                step={1}
                              />
                            }
                            {(+run === 4 || +run === 6) && (
                              <div>
                                Is Boundary
                                <div className="switch-padding form-switch form-switch-lg ">
                                  <input
                                    className="runs-input"
                                    type="checkbox"
                                    id="customSwitchsizelg"
                                    // defaultChecked
                                    placeholder="Extra Runs"
                                    checked={isBoundary}
                                    onChange={(e) => {
                                      setIsBoundary(!isBoundary);
                                    }}
                                    value={isBoundary}
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        </div>
                        <div className="col mb-4">
                          <button
                            onClick={() => extraTypehandleSubmit(WICKET)}
                            className="score-control-wicket-ball-btns"
                          >
                            Wicket
                          </button>
                        </div>
                        <div className="col d-flex justify-content-center gap-4 px-3">
                          <div
                            className="col-6"
                            onClick={() => extraTypehandleSubmit(EXTRAS)}
                          >
                            <button className="score-control-confirm-ball-btns">
                              Confirm
                            </button>
                          </div>
                          <div className="col-6" onClick={extrasTypeToggle}>
                            <button className="score-control-conformation-close-btn">
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : showWicketModal ? (
                      <>
                        {currentStep === 1 ? (
                          <>
                            <>
                              {(extraType
                                ? EXTRAS_WICKET_TYPE
                                : WICKET_TYPE_LIST
                              ).map((wicketType, index) => (
                                <div
                                  className="col"
                                  onClick={() =>
                                    handleChange("wicketType", wicketType.value)
                                  }
                                >
                                  <button
                                    className={`score-control-wicket-ball-btns ${
                                      wicketType.value === wicketData.wicketType
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    {wicketType.label}
                                  </button>
                                </div>
                              ))}
                              <div className="col" onClick={handleNext}>
                                <button className="score-control-confirm-ball-btns">
                                  Next
                                </button>
                              </div>
                              <div className="col" onClick={toggle}>
                                <button className="score-control-conformation-close-btn">
                                  Close
                                </button>
                              </div>
                            </>
                          </>
                        ) : !allFalse ? (
                          <div className="col-12 mb-2">
                            <div className="d-flex gap-2">
                              <div className="col-6">
                                <div className="col-6">
                                  <button className="score-control-wicket-ball-btns active">
                                    {getWicketTypeLabel()}
                                  </button>
                                </div>
                                {extraType && (
                                  <div className="mb-3">
                                    Ball Type: {extraType}
                                  </div>
                                )}
                                <div className="my-4 col-12">
                                  {!extraType && showFields.runs && (
                                    <div>
                                      <input
                                        className="form-control"
                                        type="number"
                                        value={wicketData.runs}
                                        onChange={(e) =>
                                          handleChange("runs", e.target.value)
                                        }
                                        min={0}
                                        max={99}
                                        step={1}
                                      />
                                    </div>
                                  )}
                                  {showFields.fielder1 && (
                                    <div className="my-4">
                                      <Select
                                        className="player-dropdown"
                                        placeholder="Fielder 1"
                                        classNamePrefix="select2-selection"
                                        value={bowlingPlayerList.find(
                                          (p) => p.value === wicketData.fielder1
                                        )}
                                        options={bowlingPlayerList}
                                        onChange={(option) =>
                                          handleChange(
                                            "fielder1",
                                            option?.value
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                  {showFields.fielder2 && (
                                    <div>
                                      <Select
                                        classNamePrefix="select2-selection"
                                        value={bowlingPlayerList.find(
                                          (p) => p.value === wicketData.fielder2
                                        )}
                                        options={bowlingPlayerList}
                                        onChange={(option) =>
                                          handleChange(
                                            "fielder2",
                                            option?.value
                                          )
                                        }
                                        placeholder="Fielder 2"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="col-6">
                                  <div className="">Select Batsman</div>
                                </div>
                                {showFields.batterId && (
                                  <div className="my-4">
                                    <div className="wicket-section-header mb-2"></div>
                                    <div className="">
                                      <div className="col-12">
                                        {/* <CardComponent
                                        title={
                                          onPitchPlayers?.[ON_STRIKE]
                                            ?.playerName
                                        }
                                        selectIcon="bx bxs-check-circle"
                                        onClickColor="#099680"
                                        bgColor="#55c6b4"
                                        check={
                                          onPitchPlayers?.[ON_STRIKE]
                                            ?.commentaryPlayerId ===
                                          wicketData.batterId
                                        }
                                        onClick={() =>
                                          handleChange(
                                            "batterId",
                                            onPitchPlayers?.[ON_STRIKE]
                                              ?.commentaryPlayerId
                                          )
                                        }
                                      /> */}
                                        <div
                                          className="col my-4"
                                          onClick={() =>
                                            handleChange(
                                              "batterId",
                                              onPitchPlayers?.[ON_STRIKE]
                                                ?.commentaryPlayerId
                                            )
                                          }
                                        >
                                          <button
                                            className={`score-control-wicket-ball-btns ${
                                              onPitchPlayers?.[ON_STRIKE]
                                                ?.commentaryPlayerId ===
                                              wicketData.batterId
                                                ? "active"
                                                : ""
                                            }`}
                                          >
                                            {
                                              onPitchPlayers?.[ON_STRIKE]
                                                ?.playerName
                                            }
                                          </button>
                                        </div>
                                      </div>
                                      <div className="col-12 gap-2">
                                        <div
                                          className="col"
                                          onClick={() =>
                                            handleChange(
                                              "batterId",
                                              onPitchPlayers?.[NON_STRIKE]
                                                ?.commentaryPlayerId
                                            )
                                          }
                                        >
                                          <button
                                            className={`score-control-wicket-ball-btns ${
                                              onPitchPlayers?.[NON_STRIKE]
                                                ?.commentaryPlayerId ===
                                              wicketData.batterId
                                                ? "active"
                                                : ""
                                            }`}
                                          >
                                            {
                                              onPitchPlayers?.[NON_STRIKE]
                                                ?.playerName
                                            }
                                          </button>
                                        </div>
                                        {/* <CardComponent
                                          title={
                                            onPitchPlayers?.[NON_STRIKE]
                                              ?.playerName
                                          }
                                          selectIcon="bx bxs-check-circle"
                                          onClickColor="#099680"
                                          bgColor="#55c6b4"
                                          check={
                                            onPitchPlayers?.[NON_STRIKE]
                                              ?.commentaryPlayerId ===
                                            wicketData.batterId
                                          }
                                          onClick={() =>
                                            handleChange(
                                              "batterId",
                                              onPitchPlayers?.[NON_STRIKE]
                                                ?.commentaryPlayerId
                                            )
                                          }
                                        /> */}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col d-flex justify-content-center gap-4 px-3 col-6">
                              <div className="col-6" onClick={handleWicketNext}>
                                <button className="score-control-confirm-ball-btns">
                                  Confirm
                                </button>
                              </div>
                              <div className="col-6" onClick={toggle}>
                                <button className="score-control-conformation-close-btn">
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="col-12">
                            {renderPlayerCard(getOutBatsman(), "batsman")}
                            {renderPlayerCard(
                              onPitchPlayers[CURRENT_BOWLER],
                              "bowler"
                            )}
                            <div className="col d-flex justify-content-center gap-4 px-3">
                              <div className="col-6" onClick={handleSubmit}>
                                <button className="score-control-confirm-ball-btns">
                                  Confirm
                                </button>
                              </div>
                              <div className="col-6" onClick={toggle}>
                                <button className="score-control-conformation-close-btn">
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
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
                        isLoading || actionPopup || showWicketModal
                          ? "disable-button"
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
