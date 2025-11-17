import React, { forwardRef, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { updateToastData } from '../../Features/toasterSlice'
import { ERROR, BATTING_STATUS, BOWLING_STATUS, WARNING, SUCCESS } from '../../components/Common/Const'
import CardComponent from './CardComponent'
import SelectPlayerModal from './CommentaryModels/SelectPlayerModal'
import axiosInstance from '../../Features/axios'
import { clone } from 'lodash'
import SegmentedSwitch from '../../components/Common/Reusables/SegmentSwitch'
import UndoInningsModal from './CommentaryModels/UndoInningsModal'
import { compareNumStringValues } from "../../components/Common/Reusables/reusableMethods.js"
import { CURRENT_BOWLER, ON_STRIKE, NON_STRIKE, } from './CommentartConst.js'
import { UndoErrorModal } from "./CommentaryModels/UndoErrorModal.jsx"

const PlayerSelection = forwardRef((props, ref) => {
  document.title = "Player Selection";
  const { data, next, previous, save, isPredictToggle, fetchData, undoInningsPopup, setUndoInningsPopup } = props;
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeamsDetails, setCommentaryTeamsDetails] = useState([]);
  const [commentaryTeamsPlayersDetails, setCommentaryTeamsPlayersDetails] = useState([]);
  const [currentInnings, setCurrentInnings] = useState(undefined)

  const [battingteam, setBattingteam] = useState(null);
  const [bowlingteam, setBowlingingteam] = useState(null);

  const [battingteamplayer, setBattingtemaplayer] = useState([]);
  const [bowlingteamplayer, setBowlingtemaplayer] = useState([]);
  const [teamListStatus, setTeamListStatus] = useState([]);
  const [isSelectingStriker, setIsSelectingStriker] = useState(true);

  const [selectedBowler, setSelectedBowler] = useState(null);
  const [selectedStriker, setSelectedStriker] = useState(null);
  const [selectedNonStriker, setSelectedNonStriker] = useState(null);
  const [playersToUpdate, setPlayersToUpdate] = useState([])
  const [isNext, setIsNext] = useState(false);

  // Add over type state variables
  const [overTypeOptions, setOverTypeOptions] = useState([]);
  const [selectedOverType, setSelectedOverType] = useState(null);

  const [undoErrorModal, setUndoErrorModal] = useState(null);

  useEffect(() => {
    if (data) {
      const commentaryDetails = data.commentaryDetails
      const newPlayerToUpdate = []
      const updatedPlayers = data.commentaryPlayers?.map(player => {
        if (player.isPlay) {
          newPlayerToUpdate.push(player)
          return { ...player, isPlay: null }
        }
        if (player.onStrike) {
          newPlayerToUpdate.push(player)
          return { ...player, onStrike: null }
        }
        return player
      })
      // Add over type options loading
      const overTypeOptionsData = data?.overTypes?.map((element) => {
        if (element.isActive) {
          const valueSet = {
            label: element.overType,
            value: element.id
          }
          if (element.isDefault) {
            setSelectedOverType(valueSet)
          }
          return valueSet
        }
        return null
      }).filter(x => x)

      setOverTypeOptions(overTypeOptionsData || [])
      setPlayersToUpdate(newPlayerToUpdate)
      setCommentaryDetails(commentaryDetails);
      setCurrentInnings(commentaryDetails?.currentInnings)
      setCommentaryTeamsDetails(data.commentaryTeams);
      setCommentaryTeamsPlayersDetails(updatedPlayers);
    }
  }, [data]);

  useEffect(() => {
    if (selectedBowler && selectedStriker && selectedNonStriker) {
      // If over type options exist, require over type selection
      if (overTypeOptions.length > 0) {
        setIsNext(selectedOverType ? true : false);
      } else {
        setIsNext(true);
      }
    }
  }, [selectedBowler, selectedStriker, selectedNonStriker, selectedOverType, overTypeOptions])

  useEffect(() => {
    if (commentaryTeamsDetails) {
      const battingteam = commentaryTeamsDetails.find(
        (team) => team.teamStatus === 1 && team.currentInnings === currentInnings
      );
      const bowlingteam = commentaryTeamsDetails.find(
        (team) => team.teamStatus === 2 && team.currentInnings === currentInnings
      );
      if (battingteam) setBattingteam(battingteam)
      if (bowlingteam) setBowlingingteam(bowlingteam)
    }
  }, [commentaryTeamsDetails]);

  useEffect(() => {
    const bowlingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (player) => player.teamId === bowlingteam?.teamId && player.currentInnings === currentInnings
    );
    setBowlingtemaplayer(bowlingTeamPlayers);
  }, [bowlingteam]);

  useEffect(() => {
    const battingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (player) => player.teamId === battingteam?.teamId && player.currentInnings === currentInnings
    );
    setBattingtemaplayer(battingTeamPlayers);
  }, [battingteam]);

  const openModel = (teamStatus, striker = true) => {
    setIsSelectingStriker(striker)
    setTeamListStatus(teamStatus)
    setIsOpen(true)
  }

  // Add over type change handler
  const onOverTypeChange = (overTypeValue, overTypeName) => {
    setSelectedOverType({
      label: overTypeName,
      value: overTypeValue
    });
  };

  const onNext = async () => {
    if (data) {
      const isPlayPlayers = [];
      const otherPlayers = []
      commentaryTeamsPlayersDetails.forEach((player) => {
        if (player.isPlay)
          isPlayPlayers.push(player)
        else otherPlayers.push(player)
      })
      if (isPlayPlayers.length !== 3) {
        return dispatch(updateToastData({ data: "Please Select Players", title: "Commentary", type: ERROR }));
      }
      const _bowlerPlayer = isPlayPlayers.find(
        (player) => player.isPlay === true && (bowlingteam?.teamId === player.teamId)
      );
      const _strikerplayer = isPlayPlayers.find(
        (player) => player.isPlay === true && player.onStrike === true && (battingteam?.teamId === player.teamId)
      );
      const _nonstriker = isPlayPlayers.find(
        (player) => player.isPlay === true && player.onStrike === false && (battingteam?.teamId === player.teamId)
      );
      const commentaryOvers = {
        overId: "0",
        commentaryId: commentaryDetails?.commentaryId,
        teamId: battingteam?.teamId,
        over: 0,
        ballCount: 0,
        bowlerId: _bowlerPlayer?.commentaryPlayerId,
        totalRun: 0,
        totalFour: 0,
        totalSix: 0,
        totalWideBall: 0,
        totalWideRun: 0,
        totalNoball: 0,
        totalNoBallRun: 0,
        totalByesRun: 0,
        totalLegByesRun: 0,
        totalPanelty: 0,
        totalWicket: 0,
        dotBall: 0,
        isComplete: false,
        powerplay: false,
        isOverInPowerplay: false,
        powerplayType: 1,
        isMaiden: false,
        date: "",
        isDelete: false,
        currentInnings: currentInnings,
        // Add over type fields
        overTypeName: selectedOverType?.label,
        overType: selectedOverType?.value,
      };
      axiosInstance
        .post(`/admin/commentary/saveDetails`, {
          commentaryId: commentaryDetails.commentaryId,
          isCallPredict: isPredictToggle,
          commentaryOvers
        })
        .then((response) => {
          const overId = response?.result?.overdetails?.overId;
          if (overId) {
            const commentaryBallByBall = {
              commentaryBallByBallId: "0",
              commentaryId: commentaryDetails?.commentaryId,
              teamId: battingteam.teamId,
              overId: overId,
              overCount: 0,
              currentOverBalls: 0,
              bowlerId: _bowlerPlayer.commentaryPlayerId,
              batStrikeId: _strikerplayer?.commentaryPlayerId,
              batNonStrikeId: _nonstriker?.commentaryPlayerId,
              ballIsCount: true,
              ballType: 0,
              ballIsDot: false,
              ballRun: 0,
              ballExtraRun: 0,
              ballIsBoundry: false,
              ballFour: 0,
              ballSix: 0,
              ballIsWicket: false,
              ballWicketType: 0,
              ballPlayerId: "0",
              ballBowlerId: 0,
              ballFielderId1: 0,
              ballFielderId2: 0,
              overIsMaiden: false,
              nextBatStrikeId: _strikerplayer?.commentaryPlayerId,
              nextBatNonStrikeId: _nonstriker?.commentaryPlayerId,
              currentInnings: currentInnings,
            };
            const newData = {
              commentaryId: commentaryDetails.commentaryId,
              isCallPredict: isPredictToggle,
              commentaryDetails: clone(commentaryDetails),
              commentaryPlayers: [].concat(isPlayPlayers || [], playersToUpdate || []),
              commentaryBallByBall,
            };
            const commentaryStatus = 3;
            newData.commentaryDetails.commentaryStatus = commentaryStatus;
            save(newData, commentaryStatus, {
              ...data,
              ...newData,
              commentaryPlayers: [
                ...isPlayPlayers,
                ...otherPlayers
              ],
              commentaryOvers: [{ ...commentaryOvers, overId }]
            })
          }
          if (response?.result?.callPredictions?.length > 0) {
            response.result.callPredictions.forEach((prediction) => {
              if (prediction?.predictioncallSuccess === false) {
                const predictionMessage = prediction?.predictionMessage;
                const endPoint = prediction?.endPoint;
                dispatch(
                  updateToastData({
                    data: `${endPoint}\n${predictionMessage}`,
                    title: prediction?.predictioonAPI,
                    type: WARNING,
                  })
                );
              }
            });
          }
        })
        .catch((error) => {
          dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        });
    }
  }

  const getTeamList = (teamListStatus) => {
    let team = [];

    if (teamListStatus === 1 && battingteamplayer.length) {
      team = battingteamplayer.sort((a, b) =>
        a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, { sensitivity: 'base' })
      );
    }
    else if (teamListStatus === 2 && bowlingteamplayer.length) {
      team = bowlingteamplayer.sort((a, b) =>
        a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, { sensitivity: 'base' })
      );
    }

    return team;
  };

  const selectPlayer = (commentaryPlayerId) => {
    const selectedPlayerIndex = commentaryTeamsPlayersDetails.findIndex(i => i.commentaryPlayerId === commentaryPlayerId && i.currentInnings === currentInnings);
    const selectedPlayer = commentaryTeamsPlayersDetails[selectedPlayerIndex];
    let updatedData = {};
    let oldCommentaryPlayerIds = [];
    const defaultValue = {
      isPlay: null,
      isBatterOut: null,
      onStrike: null,
      bowlerOver: null,
    }
    if (teamListStatus === 1 && isSelectingStriker) {
      if (selectedPlayer.commentaryPlayerId === selectedNonStriker?.commentaryPlayerId) {
        return dispatch(updateToastData({
          data: `${selectedPlayer.playerName} is already selected as Non-Striker`,
          title: "Player Selection",
          type: ERROR
        }));
      }
      setSelectedStriker(selectedPlayer)
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: true,
        isPlayInEvent: true,
      }

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails.filter(i => (i.isPlay === true &&
        i.isBatterOut === false &&
        i.onStrike === true &&
        i.currentInnings === currentInnings)).map(i => i.commentaryPlayerId);

    } else if (teamListStatus === 1 && !isSelectingStriker) {
      if (selectedPlayer.commentaryPlayerId === selectedStriker?.commentaryPlayerId) {
        return dispatch(updateToastData({
          data: `${selectedPlayer.playerName} is already selected as Striker`,
          title: "Player Selection",
          type: ERROR
        }));
      }
      setSelectedNonStriker(selectedPlayer)
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: false,
        isPlayInEvent: true,
      }

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails.filter(i => (i.isPlay === true &&
        i.isBatterOut === false &&
        i.onStrike === false &&
        i.currentInnings === currentInnings)).map(i => i.commentaryPlayerId);

    } else if (teamListStatus === 2) {
      setSelectedBowler(bowlingteamplayer.find(i => i.commentaryPlayerId === commentaryPlayerId))
      updatedData = {
        isPlay: true,
        bowlerOver: 0,
        isPlayInEvent: true,
      }

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails.filter(i => (i.isPlay === true &&
        i.bowlerOver === 0 &&
        i.currentInnings === currentInnings)).map(i => i.commentaryPlayerId);
    }

    const updatedStrikerPlayerDetails = commentaryTeamsPlayersDetails.map(
      (player) => {
        if (player.commentaryPlayerId === selectedPlayer.commentaryPlayerId && player.currentInnings === currentInnings) {
          return {
            ...player,
            ...updatedData
          };
        } else if (oldCommentaryPlayerIds.includes(player.commentaryPlayerId)) {
          return {
            ...player,
            ...defaultValue
          };
        }
        return player;
      }
    );
    setCommentaryTeamsPlayersDetails(updatedStrikerPlayerDetails);
    setIsOpen(false);
  }
  const theme = useSelector((state) => state.layout.panelTheme);

  const onUndoInnings = async () => {
    try {

      const ballHistory = data.commentaryBallByBall || [];
      const overHistory = data.commentaryOvers || [];
      const partnershipHistory = data.commentaryPartnership || [];
      const matchTypeDetails = data.matchTypeDetails || {};
      const allInningsTeams = commentaryTeamsDetails;
      const allPlayers = data.commentaryPlayers || [];

      const teams = allInningsTeams.filter(t => t.currentInnings === commentaryDetails.currentInnings);
      const currentBattingTeam = teams.find(t => t.teamStatus === BATTING_STATUS);
      const currentBowlingTeam = teams.find(t => t.teamStatus === BOWLING_STATUS);

      // console.log("- Current Batting Team:", currentBattingTeam?.shortName);
      // console.log("- Current Bowling Team:", currentBowlingTeam?.shortName);

      if (!currentBattingTeam || !currentBowlingTeam) {
        setUndoErrorModal("Unable to find both teams");
        return;
      }

      const sameInningsTeams = allInningsTeams.filter(
        t => t.currentInnings === commentaryDetails.currentInnings
      );
      const hasBattingCompleteInSameInnings = sameInningsTeams.some(t => t.isBattingComplete);

      const isMultiInnings = matchTypeDetails.noOfIningsPerSide > 1 && !hasBattingCompleteInSameInnings;

      let updatedTeams = [];
      let restoredOver = null;
      let restoredPartnership = null;
      let newCurrentInnings = commentaryDetails.currentInnings;
      let updatedOnPitchPlayers = [];
      let ballToRestore = [];

      // ========== SCENARIO 1: SINGLE INNINGS ==========
      if (hasBattingCompleteInSameInnings) {
        const firstBattingTeam = currentBowlingTeam; // Team that batted first and completed
        const secondBattingTeam = currentBattingTeam; // Team currently batting (not started yet on player selection)

        // Get first batting team's balls
        const firstTeamBalls = ballHistory.filter(ball =>
          ball.currentInnings === commentaryDetails.currentInnings &&
          compareNumStringValues(ball.teamId, firstBattingTeam.teamId)
        ).sort((a, b) => a.commentaryBallByBallId - b.commentaryBallByBallId);

        // console.log("First team balls found:", firstTeamBalls);

        if (firstTeamBalls.length < 1) {
          setUndoErrorModal("Not enough balls found for first batting team");
          return;
        }

        // last Ball
        ballToRestore = firstTeamBalls[firstTeamBalls.length - 1];

        const bowlToAdd = ((+ballToRestore?.currentOverBalls) / 10);

        // Extract player IDs from ball to restore
        const bowlerId = ballToRestore.bowlerId;
        const batStrikeId = ballToRestore?.batStrikeId ? ballToRestore.batStrikeId : ballToRestore.nextBatStrikeId;
        const batNonStrikeId = ballToRestore?.batNonStrikeId ? ballToRestore.batNonStrikeId : ballToRestore.nextBatNonStrikeId;

        // Get first batting team's last over
        const firstTeamOvers = overHistory.filter(over =>
          over.currentInnings === commentaryDetails.currentInnings &&
          compareNumStringValues(over.teamId, firstBattingTeam.teamId)
        ).sort((a, b) => a.overId - b.overId);

        if (firstTeamOvers.length === 0) {
          setUndoErrorModal("No overs found for first batting team");
          return;
        }

        const lastFirstTeamOver = firstTeamOvers[firstTeamOvers.length - 1];

        // Restored over
        restoredOver = {
          ...lastFirstTeamOver,
          isComplete: false,
        };

        // Find players for updatedOnPitchPlayers
        allPlayers.forEach(player => {
          if (compareNumStringValues(player.teamId, firstBattingTeam.teamId)) {
            if (compareNumStringValues(player.commentaryPlayerId, batStrikeId)) {
              updatedOnPitchPlayers[ON_STRIKE] = {
                ...player,
                isPlay: true,
                onStrike: true
              };
            } else if (compareNumStringValues(player.commentaryPlayerId, batNonStrikeId)) {
              updatedOnPitchPlayers[NON_STRIKE] = {
                ...player,
                isPlay: true,
                onStrike: false
              };
            }
          } else if (compareNumStringValues(player.teamId, secondBattingTeam.teamId)) {
            if (compareNumStringValues(player.commentaryPlayerId, bowlerId)) {
              updatedOnPitchPlayers[CURRENT_BOWLER] = {
                ...player,
                isPlay: true,
              };
            }
          }
        });

        // Find partnership
        let firstTeamPartnerships = partnershipHistory.filter(partnership =>
          partnership.currentInnings === commentaryDetails.currentInnings &&
          compareNumStringValues(partnership.teamId, firstBattingTeam.teamId)
        ).sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId) || [];

        firstTeamPartnerships = Array.isArray(firstTeamPartnerships)
          ? firstTeamPartnerships
          : [firstTeamPartnerships];

        for (let i = firstTeamPartnerships.length - 1; i >= 0; i--) {
          const p = firstTeamPartnerships[i];
          if ((compareNumStringValues(p.batter1Id, batStrikeId) && compareNumStringValues(p.batter2Id, batNonStrikeId)) ||
            (compareNumStringValues(p.batter1Id, batNonStrikeId) && compareNumStringValues(p.batter2Id, batStrikeId))) {
            restoredPartnership = {
              ...p,
              isActive: true,
            };
            break;
          }
        }
        // console.log("firstTeamPartnership Restored", restoredPartnership);

        //team updates
        updatedTeams = [
          {
            ...firstBattingTeam,
            teamStatus: BATTING_STATUS,
            isBattingComplete: false,
            teamOver: ballToRestore ? (+ballToRestore?.overCount)?.toFixed(1) : (((+firstBattingTeam.teamOver || 0) - 1) + bowlToAdd)?.toFixed(1),
          },
          {
            ...secondBattingTeam,
            teamStatus: BOWLING_STATUS,
          }
        ];

        newCurrentInnings = commentaryDetails.currentInnings;

      }
      // ========== SCENARIO: MULTI-INNINGS ==========
      else if (isMultiInnings) {
        const targetInnings = commentaryDetails.currentInnings - 1;

        // Finding previous innings' last batting team
        let previousBattingTeam = null;
        let previousBowlingTeam = null;

        allInningsTeams.forEach(team => {
          if (team.currentInnings === targetInnings) {
            if (!previousBattingTeam || team.teamBattingOrder > previousBattingTeam.teamBattingOrder) {
              previousBattingTeam = team;
            }
          }
        });

        allInningsTeams.forEach(team => {
          if (team.currentInnings === targetInnings && !compareNumStringValues(team.teamId, previousBattingTeam?.teamId)) {
            previousBowlingTeam = team;
          }
        });

        if (!previousBattingTeam || !previousBowlingTeam) {
          setUndoErrorModal("Cannot find previous innings teams");
          return;
        }

        // console.log("Previous batting team:", previousBattingTeam.shortName);
        // console.log("Previous bowling team:", previousBowlingTeam.shortName);

        // Get previous innings' balls
        const previousTeamBalls = ballHistory.filter(ball =>
          ball.currentInnings === targetInnings &&
          compareNumStringValues(ball.teamId, previousBattingTeam.teamId)
        ).sort((a, b) => a.commentaryBallByBallId - b.commentaryBallByBallId);

        if (previousTeamBalls.length < 1) {
          setUndoErrorModal("Not enough balls found in previous innings");
          return;
        }

        // last Ball
        ballToRestore = previousTeamBalls[previousTeamBalls.length - 1];

        const bowlToAdd = ((+ballToRestore?.currentOverBalls) / 10);

        // Extract player IDs
        const bowlerId = ballToRestore.bowlerId;
        const batStrikeId = ballToRestore?.batStrikeId ? ballToRestore.batStrikeId : ballToRestore.nextBatStrikeId;
        const batNonStrikeId = ballToRestore?.batNonStrikeId ? ballToRestore.batNonStrikeId : ballToRestore.nextBatNonStrikeId;

        // Get previous innings' overs
        const previousTeamOvers = overHistory.filter(over =>
          over.currentInnings === targetInnings &&
          compareNumStringValues(over.teamId, previousBattingTeam.teamId)
        ).sort((a, b) => a.overId - b.overId);

        if (previousTeamOvers.length === 0) {
          setUndoErrorModal("No overs found in previous innings");
          return;
        }

        const lastPreviousTeamOver = previousTeamOvers[previousTeamOvers.length - 1];

        // Restored over
        restoredOver = {
          ...lastPreviousTeamOver,
          isComplete: false,
        };

        // Find players
        allPlayers.forEach(player => {
          if (compareNumStringValues(player.teamId, previousBattingTeam.teamId)) {
            if (compareNumStringValues(player.commentaryPlayerId, batStrikeId)) {
              updatedOnPitchPlayers[ON_STRIKE] = {
                ...player,
                isPlay: true,
                onStrike: true
              };
            } else if (compareNumStringValues(player.commentaryPlayerId, batNonStrikeId)) {
              updatedOnPitchPlayers[NON_STRIKE] = {
                ...player,
                isPlay: true,
                onStrike: false
              };
            }
          } else if (compareNumStringValues(player.teamId, previousBowlingTeam.teamId)) {
            if (compareNumStringValues(player.commentaryPlayerId, bowlerId)) {
              updatedOnPitchPlayers[CURRENT_BOWLER] = {
                ...player,
                isPlay: true,
              };
            }
          }
        });

        // partnership
        let previousTeamPartnerships = partnershipHistory
          ?.filter(partnership =>
            partnership.currentInnings === targetInnings &&
            compareNumStringValues(partnership.teamId, previousBattingTeam.teamId)
          ).sort((a, b) => b.commentaryPartnershipId - a.commentaryPartnershipId) || [];

        previousTeamPartnerships = Array.isArray(previousTeamPartnerships)
          ? previousTeamPartnerships
          : [previousTeamPartnerships];

        for (let i = previousTeamPartnerships?.length - 1; i >= 0; i--) {
          const p = previousTeamPartnerships[i];
          if ((compareNumStringValues(p.batter1Id, batStrikeId) && compareNumStringValues(p.batter2Id, batNonStrikeId)) ||
            (compareNumStringValues(p.batter1Id, batNonStrikeId) && compareNumStringValues(p.batter2Id, batStrikeId))) {
            restoredPartnership = {
              ...p,
              isActive: true,
            };
            break;
          }
        }

        // Prepare team updates
        updatedTeams = [
          {
            ...previousBattingTeam,
            teamStatus: BATTING_STATUS,
            isBattingComplete: false,
            teamOver: ballToRestore ? (+ballToRestore?.overCount)?.toFixed(1) : (((+previousBattingTeam.teamOver || 0) - 1) + bowlToAdd)?.toFixed(1),
          },
          {
            ...previousBowlingTeam,
            teamStatus: BOWLING_STATUS,
          }
        ];

        // Decrease currentInnings for multi-innings
        newCurrentInnings = targetInnings;

      } else {
        setUndoErrorModal("Cannot undo innings: Invalid state. Match must be in a valid innings transition state.");
        return;
      }

      // Prepare API payload
      const payload = {
        commentaryId: commentaryDetails.commentaryId,
        commentaryPlayers: [...Object.values(updatedOnPitchPlayers)],
        commentaryDetails: {
          ...commentaryDetails,
          currentInnings: newCurrentInnings,
          commentaryStatus: 3,
        },
        commentaryTeams: updatedTeams,
        commentaryOvers: restoredOver,
        commentaryPartnership: restoredPartnership,
      };
      // console.log("payload",payload)

      // console.log("\n=== API PAYLOAD ===");
      // console.log("Teams to update:", updatedTeams);
      // console.log("Balls to delete:", deleteBallIds);
      // console.log("Wickets to delete:", deleteWickets);
      // console.log("New current innings:", newCurrentInnings);

      // Call API
      await axiosInstance.post('/admin/commentary/undoDetails', payload)
        .then(async (response) => {
          setUndoInningsPopup(false);

          // Show success message
          dispatch(
            updateToastData({
              data: response?.data?.message || "Innings undo successful",
              title: "Success",
              type: SUCCESS,
            })
          );
          await props.fetchData();
          props.undoNext();
        })
        .catch((error) => {
          setUndoErrorModal(
            error?.response?.data?.message ||
            error?.message ||
            "Failed to undo innings"
          );
        });

    } catch (error) {
      console.error("=== ERROR IN UNDO INNINGS ===");
      console.error("Error:", error);
      console.error("Stack:", error.stack);
      setUndoErrorModal("An error occurred while undoing innings: " + error.message);      
    }
    finally {
      setUndoInningsPopup(false);
    }
  };

  return (
    <React.Fragment>
      <div /* className="page-content" */>
        <Container >
          <Card className='shadow-none toss-card mb-0'>
            <CardHeader className="toss-card-header">
              <h2>
                Player Selection
              </h2>
            </CardHeader>
            <CardBody>
              <CardTitle className="h4 toss-card-title">
                <h4>
                  Please Select {battingteam?.teamName} Opening Batter
                </h4>
              </CardTitle>
              <Row className='p-1'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Striker"}
                    check={selectedStriker?.playerName}
                    name={selectedStriker?.playerName}
                    onClick={() => openModel(BATTING_STATUS)}
                    bgColor={"#0BB197"}
                    onClickColor={"#007B64"}
                    isPlayerName={true}
                  />
                </Col>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Non-Striker"}
                    check={selectedNonStriker?.playerName}
                    name={selectedNonStriker?.playerName}
                    onClick={() => openModel(BATTING_STATUS, false)}
                    icon={"bx bxs-check-circle"}
                    bgColor={"#0BB197"}
                    onClickColor={"#007B64"}
                    isPlayerName={true}
                  />
                </Col>
              </Row>
              <CardTitle className="h4 toss-card-title">
                <h4>
                  Please Select {bowlingteam?.teamName} Opening Bowler
                </h4>
              </CardTitle>
              <Row className='p-1'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Bowler"}
                    check={selectedBowler?.playerName}
                    name={selectedBowler?.playerName}
                    onClick={() => openModel(BOWLING_STATUS)}
                    bgColor={"#FCC042"}
                    onClickColor={"#CB8F00"}
                    isPlayerName={true}
                  />
                </Col>
              </Row>

              {/* Add Over Type Selection after bowler is selected */}
              {selectedBowler && overTypeOptions.length > 0 && (
                <>
                  <CardTitle className="h4 toss-card-title">
                    <h4>Select Over Type</h4>
                  </CardTitle>
                  <Row className='p-1'>
                    <Col xs="12">
                      <SegmentedSwitch
                        options={overTypeOptions}
                        selectedValue={selectedOverType?.value}
                        onSelectionChange={onOverTypeChange}
                      />
                    </Col>
                  </Row>
                </>
              )}
            </CardBody>
          </Card>
          <Container className='d-flex justify-content-between flex-wrap' >
            {isNext && (<Button
              className='m-2 d-flex align-items-center'
              id="caret" color="primary" onClick={onNext}>
              <span>Save & Next</span>
              <i className='bx bxs-right-arrow ms-1'></i>
            </Button>)}
          </Container>
          <UndoInningsModal
            isOpen={undoInningsPopup}
            toggle={() => setUndoInningsPopup(false)}
            onLastInningsClick={onUndoInnings}
          />

          {undoErrorModal && <UndoErrorModal
            toggle={() => { setUndoErrorModal(null); }}
            undoError={undoErrorModal}
          />}
        </Container>
        <SelectPlayerModal isOpen={isOpen} toggle={toggle} playerList={getTeamList(teamListStatus)} selectPlayer={selectPlayer} isBowler={teamListStatus == 2 ? true : false} />
      </div>
    </React.Fragment>
  )
})

export default PlayerSelection