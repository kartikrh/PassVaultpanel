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

// const CenteredBadge = styled.div`
//   position: absolute;
//   background: ${(props) => props.bgColor || "blue"};
//   padding: 2px 26px;
//   top: -6px;
//   right: 50%;
//   font-size: 10px;
//   transform: translateX(50%);
//   border-radius: 0px 0px 60px 60px;
// `;

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
  cricketFieldToggle
}) => {
  console.log("cricketFieldIsOpen",cricketFieldIsOpen)

  const [changePlayerType, setChangePlayerType] = useState(false);
  const [trackingBall, setTrackingBall] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionPopup, setActionPopup] = useState(undefined);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showRunsPopup, setShowRunsPopup] = useState(false);
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
    // console.log("objToSend", objToSend)
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
    // console.log("newPlayerId", newPlayerId)
    const oldPlayer = onPitchplayers[changePlayerType];
    let toSend = {
      ...onPitchplayers,
      [RETIRED_HURT_BATTER]: { ...oldPlayer, isPlay: null, onStrike: null },
      [PREV_ON_STRIKE]: onPitchplayers[ON_STRIKE],
      [PREV_NON_STRIKE]: onPitchplayers[NON_STRIKE],
    };
    toSend[PLAYER_LIST] = allBattingPlayers.map((player) => {
      let updatedPlayer = player;
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

    if (typeof retiredHurtonsubmit !== "function") {
      console.error(
        "retiredHurtonsubmit is not a function",
        retiredHurtonsubmit
      );
      return;
    }
    retiredHurtonsubmit(toSend);
  };
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
    showWicketModal && toggle()
    (retiredHurtisOpen && !changePlayerType) && retiredHurttoggle()
    extrasTypeIsOpen && extrasTypeToggle()
    actionPopup &&  setActionPopup(false)
    showRunsPopup && setShowRunsPopup(false)
    cricketFieldIsOpen && cricketFieldToggle()
  }

  // console.log("cricketFieldIsOpen", cricketFieldIsOpen)
  // console.log("showChangeOverModal", showChangeOverModal)
  // console.log("showPlayerModal", showPlayerModal)
  // console.log("extrasTypeIsOpen", extrasTypeIsOpen)
  // console.log("showWicketModal", showWicketModal)

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
                showChangeOverModal || cricketFieldIsOpen) && 
                  <button className="control-center-back-btn me-2" onClick={check}>
                    <img
                      role="button"
                      className="back-icon"
                      // onClick={() => setStatusPopup(true)}
                      src="icons/back.png"
                      alt="Icon"
                      style={{color: "black"}}
                      // height="10px"
                    />
                  </button>}
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
                {actionPopup || showWicketModal || extrasTypeIsOpen || showChangeOverModal || showPlayerModal || cricketFieldIsOpen ? (
                  <div
                    className={`row row-cols-2 g-2 col-12 ${
                      isLoading ? "disable-button" : ""
                    }`}
                  >
                    {console.log("fdsgfd")}
                    {actionPopup ? (
                      <div className="col-12 row row-cols-2">
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
                            {!changePlayerType && (
                              <div className="col-6">
                                <div>Retired Hurt</div>
                                <div>Please select a batter:</div>
                                <div
                                  className="col my-4"
                                  onClick={() => setChangePlayerType(ON_STRIKE)}
                                >
                                  <button
                                    className={`score-control-wicket-ball-btns ${
                                      changePlayerType == ON_STRIKE
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    {onPitchPlayers?.[ON_STRIKE]?.playerName}
                                  </button>
                                </div>
                                <div
                                  className="col my-4"
                                  onClick={() =>
                                    setChangePlayerType(NON_STRIKE)
                                  }
                                >
                                  <button
                                    className={`score-control-wicket-ball-btns ${
                                      changePlayerType == ON_STRIKE
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    {onPitchPlayers?.[NON_STRIKE]?.playerName}
                                  </button>
                                </div>
                                {/* <div
                                  className="col-6"
                                  onClick={() => retiredHurttoggle()}
                                >
                                  <button className="score-control-conformation-close-btn">
                                    Close
                                  </button>
                                </div> */}
                              </div>
                            )}
                            {changePlayerType && (
                              <SelectPlayerControls
                                isOpen={true}
                                toggle={() => {
                                  setChangePlayerType(null);
                                  setActionPopup(false);
                                }}
                                playerList={retiredHurtplayerList}
                                selectPlayer={onSubmitClick}
                              />
                            )}
                          </div>
                        ) : showRunsPopup ? (
                          <div className="col-8">
                          <RunsControls
                            toggle={() => setShowRunsPopup(false)}
                            onSubmitClick={(runs) => handleRuns(runs, 1)}
                          />
                          </div>
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
                      <div className="col-12 row row-cols-2 ">
                        {currentStep === 1 ? (
                          <div className="col-8  row row-cols-2">
                            {(extraType
                              ? EXTRAS_WICKET_TYPE
                              : WICKET_TYPE_LIST
                            ).map((wicketType, index) => (
                              <div
                                className="col my-1"
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
                            <div className="col-12 my-2 mt-5" onClick={handleNext}>
                              <button className="score-control-confirm-ball-btns">
                                Next
                              </button>
                            </div>
                          </div>
                        ) : !allFalse ? (
                          <div className="col-12 mb-2">
                            <div className="d-flex gap-2">
                              <div className="col-6">
                                <div className="col-6">
                                  <button className="score-control-wicket-ball-btns active">
                                    {getWicketTypeLabel()}
                                  </button>
                                </div>
                                <div className="my-4 col-12">
                                  {!extraType && showFields.runs && (
                                    <div>
                                      <input
                                        className="runs-input"
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
                                        classNamePrefix="score-dropdown-select2-selection"
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
                                {showFields.batterId && (
                                  <div className="my-4">
                                    <div className="col-6">
                                      <div className="">Select Batsman</div>
                                    </div>
                                    <div className="wicket-section-header mb-2"></div>
                                    <div className="">
                                      <div className="col-12">
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
                            <div className="col d-flex justify-content-center gap-4 col-6">
                              <div className="col-12" onClick={handleWicketNext}>
                                <button className="score-control-confirm-ball-btns">
                                  Update
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
                              <div className="col-12" onClick={handleSubmit}>
                                <button className="score-control-confirm-ball-btns">
                                  Update
                                </button>
                              </div>
                              {/* <div className="col-6" onClick={toggle}>
                                <button className="score-control-conformation-close-btn">
                                  Close
                                </button>
                              </div> */}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : extrasTypeIsOpen ? (
                      <div className="col-6">
                        <div className="col-6">
                          <button className="score-control-ball-types-btns active">
                            {extraType?.type || extraType}
                          </button>
                        </div>
                        <div className="my-4 col-12">
                          <>
                            {
                              <input
                                className="runs-input"
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
                        <div className="col mb-2 mt-5">
                          <button
                            onClick={() => extraTypehandleSubmit(WICKET)}
                            className="score-control-wicket-ball-btns"
                          >
                            Wicket
                          </button>
                        </div>
                        <div className="col d-flex justify-content-center gap-4">
                          <div
                            className="col-12"
                            onClick={() => extraTypehandleSubmit(EXTRAS)}
                          >
                            <button className="score-control-confirm-ball-btns">
                              Update
                            </button>
                          </div>
                          {/* <div className="col-6" onClick={extrasTypeToggle}>
                            <button className="score-control-conformation-close-btn">
                              Close
                            </button>
                          </div> */}
                        </div>
                      </div>
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
                    )
                    
                    :(
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
                        isLoading || actionPopup || showWicketModal || showChangeOverModal || showPlayerModal
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
