import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Select from "react-select";
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR, SUCCESS } from '../../components/Common/Const';
import SpinnerModel from "../../components/Model/SpinnerModel";
import "./CommentaryCss.css";
import { isEmpty } from 'lodash';
import { Avatar } from "antd";
import ball from '../../../src/assets/images/cricket-icons/cricket-ball.png';
import bat from '../../../src/assets/images/cricket-icons/cricket-bat.png';
import allrounder from '../../../src/assets/images/cricket-icons/cricket.png';
import keeper from '../../../src/assets/images/cricket-icons/game.png';
import { convertDateUtcFormat24, convertDateUTCToLocal2_24 } from '../../components/Common/Reusables/reusableMethods';

const TeamPlayerCard = ({ commentaryId, eventRefId, teamDetails, inningPlayers, fetchData, currentInnings, bowlingType, updateAllInnings, allTeamPlayers, commentaryData, dateType }) => {
    const [commentaryTeamPlayers, setCommentaryTeamPlayers] = useState([]);
    const [nonCommentaryTeamPlayers, setNonCommentaryTeamPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [editedPlayers, setEditedPlayers] = useState({});
    const [updatedPlayingXiPlayer, setUpdatedPlayingXi] = useState({});
    const [showInningsModal, setShowInningsModal] = useState(false);
    const [inningstoAddPlayer, setInningstoAddPlayer] = useState([]);
    const [pendingPlayerData, setPendingPlayerData] = useState(null);
    const [currentInningsIndex, setCurrentInningsIndex] = useState(0);
    const dispatch = useDispatch();

    useEffect(() => {
        if (inningPlayers && teamDetails?.teamPlayers) {
            const teamPlayers = inningPlayers.filter((item) => item?.playerId !== null);
            setCommentaryTeamPlayers(teamPlayers);
            const selectedIds = teamPlayers.map(player => player.playerId)
            const dropdownValues = teamDetails?.teamPlayers.filter(player => !selectedIds.includes(player.playerId));
            setNonCommentaryTeamPlayers(dropdownValues)
        }
    }, [teamDetails]);

    const handleAddPlayer = async () => {
        const playerIndex = nonCommentaryTeamPlayers.findIndex(player => player.playerId === selectedPlayer?.value)
        if (playerIndex !== -1) {
            setIsLoading(true);
            await axiosInstance
                .post("/admin/commentary/addTeamPlayer", { commentaryId, teamId: teamDetails?.teamId, playerId: selectedPlayer?.value, currentInnings: currentInnings })
                .then((response) => {
                    setCommentaryTeamPlayers(prev => [...prev, { teamId: teamDetails?.teamId, playerId: selectedPlayer?.value, playerName: nonCommentaryTeamPlayers[playerIndex]?.playerName }])
                    setNonCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)])
                    // Check for other innings only if totalInnings > 1
                    if (commentaryData?.totalInnings > 1) {
                        checkAndShowInningsModal(selectedPlayer?.value, nonCommentaryTeamPlayers[playerIndex]?.playerName);
                    }
                    setSelectedPlayer(undefined);
                    if (commentaryData?.totalInnings <= 1) {
                        fetchData(commentaryId);
                    }
                    setIsLoading(false);                    
                })
                .catch((error) => {
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    setIsLoading(false);
                });
        }
    }

  const checkAndShowInningsModal = (playerId, playerName) => {
    const currentTeamData = allTeamPlayers?.find(team => team.teamId === teamDetails?.teamId);

    if (!currentTeamData?.commentaryTeamPlayers) {
      return;
    }

    const allInningsKeys = Object.keys(currentTeamData.commentaryTeamPlayers);

    // Find innings where this player is NOT present
    const inningsWithoutPlayer = [];

    allInningsKeys.forEach(inningKey => {
      const inningNumber = inningKey.replace('currentInnings', '');
      const playersInInning = currentTeamData.commentaryTeamPlayers[inningKey];

      // Skip the current innings
      if (parseInt(inningNumber) === parseInt(currentInnings)) {
        return;
      }

      // Check if player exists in this innings
      const playerExists = playersInInning?.some(player => player.playerId === playerId);

      if (!playerExists) {
        inningsWithoutPlayer.push(inningNumber);
      }
    });

    // Show modal only if player is not present in other innings
    if (inningsWithoutPlayer.length > 0) {
      setInningstoAddPlayer(inningsWithoutPlayer);
      setPendingPlayerData({ playerId, playerName });
      setCurrentInningsIndex(0); 
      setShowInningsModal(true);
    } else { fetchData(commentaryId)}
  };

  const handleAddToOtherInnings = async () => {
    if (!pendingPlayerData || inningstoAddPlayer.length === 0) {
      return;
    }

    const currentInningsToAdd = inningstoAddPlayer[currentInningsIndex];

    try {
      // Add player to only the current innings acted upon
      await axiosInstance.post("/admin/commentary/addTeamPlayer", {
        commentaryId,
        teamId: teamDetails?.teamId,
        playerId: pendingPlayerData.playerId,
        currentInnings: parseInt(currentInningsToAdd)
      });

      dispatch(updateToastData({
        data: `Player added to innings ${currentInningsToAdd}`,
        title: "Success",
        type: SUCCESS
      }));

      // Move to next innings
      const nextIndex = currentInningsIndex + 1;

      if (nextIndex < inningstoAddPlayer.length) {
        // More innings to process, show modal for next innings
        setCurrentInningsIndex(nextIndex);
      } else {
        // No more innings, close modal and refresh
        setShowInningsModal(false);
        setInningstoAddPlayer([]);
        setPendingPlayerData(null);
        setCurrentInningsIndex(0);
        fetchData(commentaryId);
      }
    } catch (error) {
      dispatch(updateToastData({
        data: error?.message || "Failed to add player to innings",
        title: error?.title || "Error",
        type: ERROR
      }));
    }
  };

  const handleCloseInningsModal = () => {
    // Move to next innings without adding
    const nextIndex = currentInningsIndex + 1;

    if (nextIndex < inningstoAddPlayer.length) {
      // More innings to process, show modal for next innings
      setCurrentInningsIndex(nextIndex);
    } else {
      // No more innings, close modal and refresh
      setShowInningsModal(false);
      setInningstoAddPlayer([]);
      setPendingPlayerData(null);
      setCurrentInningsIndex(0);
      fetchData(commentaryId);
    }
  };

    // const handleDeletePlayer = async (playerId) => {
    //     const playerIndex = commentaryTeamPlayers.findIndex(player => player.playerId === playerId)
    //     if (playerIndex !== -1) {
    //         const commentaryPlayerId = commentaryTeamPlayers[playerIndex].commentaryPlayerId;
    //         setIsLoading(true);
    //         await axiosInstance
    //             .post("/admin/commentary/deleteTeamPlayer", { commentaryId, commentaryPlayerId })
    //             .then((response) => {
    //                 // commentaryId, teamId: teamDetails?.teamId, playerId: playerId
    //                 setIsLoading(false);
    //                 setNonCommentaryTeamPlayers(prev => [...prev, { teamId: teamDetails?.teamId, playerId: playerId, playerName: commentaryTeamPlayers[playerIndex]?.playerName }])
    //                 setCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)])
    //             })
    //             .catch((error) => {
    //                 dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    //                 setIsLoading(false);
    //             });
    //     }
    // }

  const handleDeletePlayer = async (playerId) => {
    if (updateAllInnings && allTeamPlayers) {
      // Delete player from all innings
      setIsLoading(true);

      try {
        const commentaryPlayerIdsToDelete = [];
        const skippedInningsPlayerActive = [];
        const playerDeletedInnings = [];

        allTeamPlayers.forEach(team => {
          if (team.teamId === teamDetails.teamId && team.commentaryTeamPlayers) {
            Object.keys(team.commentaryTeamPlayers).forEach(inningKey => {
              const players = team.commentaryTeamPlayers[inningKey];
              const matchingPlayer = players.find(p => p.playerId === playerId);

              if (matchingPlayer && matchingPlayer.commentaryPlayerId) {
                const canDelete = !(
                  matchingPlayer.isPlay ||
                  matchingPlayer.isBatterOut ||
                  matchingPlayer.onStrike === true ||
                  matchingPlayer.onStrike === false ||
                  matchingPlayer.isBatterRetir
                );
                if (canDelete) {
                  commentaryPlayerIdsToDelete.push(matchingPlayer.commentaryPlayerId);
                  playerDeletedInnings.push(matchingPlayer.currentInnings ?? inningKey.replace("inning", ""));
                } else {
                  skippedInningsPlayerActive.push(matchingPlayer.currentInnings ?? inningKey.replace("inning", ""));
                }
              }
            });
          }
        });

        if (commentaryPlayerIdsToDelete.length > 0) {
          // Delete all instances using Promise.all
          const deletePromises = commentaryPlayerIdsToDelete.map(commentaryPlayerId =>
            axiosInstance.post("/admin/commentary/deleteTeamPlayer", {
              commentaryId,
              commentaryPlayerId
            })
          );

          await Promise.all(deletePromises);

          const sortPlayerDeletedInnings = playerDeletedInnings
            .map(Number)
            .sort((a, b) => a - b);
          const sortPlayerSkippedInnings = skippedInningsPlayerActive
            .map(Number)
            .sort((a, b) => a - b);

          let message = `Player deleted from innings ${sortPlayerDeletedInnings.join(", ")}. `;
          if (sortPlayerSkippedInnings.length > 0) {
            message += `Skipped innings ${sortPlayerSkippedInnings.join(', ')} (because player is active)`;
          }

          dispatch(updateToastData({
            data: message,
            title: "Success",
            type: SUCCESS
          }));

          fetchData(commentaryId);
        }

        setIsLoading(false);
      } catch (error) {
        dispatch(updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR
        }));
        setIsLoading(false);
      }
    } else {
      // Existing functionality - delete from current innings only
      const playerIndex = commentaryTeamPlayers.findIndex(player => player.playerId === playerId);

      if (playerIndex !== -1) {
        const commentaryPlayerId = commentaryTeamPlayers[playerIndex].commentaryPlayerId;
        setIsLoading(true);

        await axiosInstance
          .post("/admin/commentary/deleteTeamPlayer", { commentaryId, commentaryPlayerId })
          .then((response) => {
            setIsLoading(false);
            setNonCommentaryTeamPlayers(prev => [...prev, {
              teamId: teamDetails?.teamId,
              playerId: playerId,
              playerName: commentaryTeamPlayers[playerIndex]?.playerName
            }]);
            setCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)]);
                      })
          .catch((error) => {
            dispatch(updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR
            }));
            setIsLoading(false);
          });
      }
    }
  };

    const handleReloadTeam = async () => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/commentary/loadTeamPlayer", { teamId: teamDetails?.teamId })
            .then((response) => {
                if (response?.result) {
                    const teamPlayers = response?.result;
                    const selectedIds = commentaryTeamPlayers.map(player => player.playerId);
                    setNonCommentaryTeamPlayers(teamPlayers.filter(player => !selectedIds.includes(player.playerId)));
                    setSelectedPlayer(undefined);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
            });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const playerDataArray = Object.keys(editedPlayers).map(commentaryPlayerId => {
                let { batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven, playerId, currentInnings, bowlingType } = editedPlayers[commentaryPlayerId];
                if (!batsmanAverage) {
                    batsmanAverage = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.batsmanAverage || 0
                }
                if (!batsmanStrikeRate) {
                    batsmanStrikeRate = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.batsmanStrikeRate || 0
                }
                if (!boundary) {
                    boundary = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.boundary || 0
                }
                if (!bowlingType) {
                    bowlingType =
                    commentaryTeamPlayers.find(
                        (item) => +item.commentaryPlayerId === +commentaryPlayerId
                    )?.bowlingType || 0;
                }
                if (!playerBallFaced) {
                    playerBallFaced = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.playerBallFaced || 0
                }
                isInPlayingEleven = Object.keys(updatedPlayingXiPlayer).includes(commentaryPlayerId) ? isInPlayingEleven :
                    commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.isInPlayingEleven || false
                return { commentaryId, teamId: teamDetails?.teamId, playerId, batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven, commentaryPlayerId: +commentaryPlayerId, currentInnings: +currentInnings, bowlingType };
            });
            const payload = {
                commentaryId,
                eventRefId,
                playerDataArray,
            }
            await axiosInstance.post("/admin/commentary/updateTeamPlayer", payload);
            fetchData(commentaryId);
            setIsLoading(false);
            setEditedPlayers({});
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            setIsLoading(false);
        }
    };

  const handleAvgChange = (
    commentaryPlayerId,
    playerId,
    currentInnings,
    avg
  ) => {
    const newAvg = avg === null || avg === "" ? "" : avg;
    const originalPlayer = commentaryTeamPlayers.find(
        (p) => p.commentaryPlayerId === commentaryPlayerId
    );

    setEditedPlayers((prevState) => ({
      ...prevState,
      [commentaryPlayerId]: {
        ...prevState[commentaryPlayerId],
        batsmanAverage: newAvg,
        playerId: playerId,
        currentInnings: currentInnings,
        bowlingType: prevState[commentaryPlayerId]?.bowlingType ?? originalPlayer?.bowlingType,
        isInPlayingEleven:
          prevState[commentaryPlayerId]?.isInPlayingEleven ??
          updatedPlayingXiPlayer[commentaryPlayerId] ??
          commentaryTeamPlayers.find(
            (p) => p.commentaryPlayerId === commentaryPlayerId
          )?.isInPlayingEleven,
      },
    }));
  };

  const handleBowlerStyleChange = (
    commentaryPlayerId,
    playerId,
    currentInnings,
    bowlingTypeValue
  ) => {
    setEditedPlayers((prevState) => ({
      ...prevState,
      [commentaryPlayerId]: {
        ...prevState[commentaryPlayerId],
        bowlingType: bowlingTypeValue,
        playerId: playerId,
        currentInnings: currentInnings,
        isInPlayingEleven:
          prevState[commentaryPlayerId]?.isInPlayingEleven ??
          updatedPlayingXiPlayer[commentaryPlayerId] ??
          commentaryTeamPlayers.find(
            (p) => p.commentaryPlayerId === commentaryPlayerId
          )?.isInPlayingEleven,
      },
    }));
  };

    const handleStrikeRateChange = (commentaryPlayerId, playerId, currentInnings, strikeRate) => {
        const newStrikeRate = (strikeRate === null || strikeRate === "") ? "" : strikeRate
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                batsmanStrikeRate: newStrikeRate,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBoundaryChange = (commentaryPlayerId, playerId, currentInnings, bdry) => {
        const newBdry = (bdry === null || bdry === "") ? "" : bdry
        const originalPlayer = commentaryTeamPlayers.find(
            (p) => p.commentaryPlayerId === commentaryPlayerId
        );
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                boundary: newBdry,
                playerId: playerId,
                currentInnings: currentInnings,
                bowlingType: prevState[commentaryPlayerId]?.bowlingType ?? originalPlayer?.bowlingType,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBallFacedChange = (commentaryPlayerId, playerId, currentInnings, playerBallFaced) => {
        const newPlayerBallFaced = (playerBallFaced === null || playerBallFaced === "") ? "" : playerBallFaced
        const originalPlayer = commentaryTeamPlayers.find(
            (p) => p.commentaryPlayerId === commentaryPlayerId
        );
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                playerBallFaced: newPlayerBallFaced,
                playerId: playerId,
                currentInnings: currentInnings,
                bowlingType: prevState[commentaryPlayerId]?.bowlingType ?? originalPlayer?.bowlingType,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
  };

  const handlePlayingXiChange = async (commentaryPlayerId, playerId, currentInnings, isPlayXi) => {
    if (updateAllInnings && allTeamPlayers) {
      // Find all innings for this team and player
      const playerDataArray = [];

      allTeamPlayers.forEach(team => {
        if (team.teamId === teamDetails.teamId && team.commentaryTeamPlayers) {
          Object.keys(team.commentaryTeamPlayers).forEach(inningKey => {
            const players = team.commentaryTeamPlayers[inningKey];
            const matchingPlayer = players.find(p => p.playerId === playerId);

            if (matchingPlayer) {
              playerDataArray.push({
                commentaryId,
                teamId: teamDetails.teamId,
                playerId: matchingPlayer.playerId,
                batsmanAverage: matchingPlayer.batsmanAverage || 0,
                batsmanStrikeRate: matchingPlayer.batsmanStrikeRate || 0,
                boundary: matchingPlayer.boundary || 0,
                playerBallFaced: matchingPlayer.playerBallFaced || 0,
                isInPlayingEleven: isPlayXi,
                commentaryPlayerId: matchingPlayer.commentaryPlayerId,
                currentInnings: matchingPlayer.currentInnings,
                bowlingType: matchingPlayer.bowlingType || 0
              });
            }
          });
        }
      });

      if (playerDataArray.length > 0) {
        try {
          const payload = {
            commentaryId,
            eventRefId,
            playerDataArray,
          };
          await axiosInstance.post("/admin/commentary/updateTeamPlayer", payload);

          fetchData(commentaryId);
        } catch (error) {
          dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        }
      }
    } else {
      const originalPlayer = commentaryTeamPlayers.find(
        (p) => p.commentaryPlayerId === commentaryPlayerId
      );
      // Existing functionality
      setEditedPlayers(prevState => ({
        ...prevState,
        [commentaryPlayerId]: {
          ...prevState[commentaryPlayerId],
          playerId: playerId,
          currentInnings: currentInnings,
          isInPlayingEleven: isPlayXi,
          bowlingType: prevState[commentaryPlayerId]?.bowlingType ?? originalPlayer?.bowlingType,
        }
      }));
      setUpdatedPlayingXi(prevState => ({ ...prevState, [commentaryPlayerId]: isPlayXi }));
    }
  };

  // const handlePlayingXiChange = (commentaryPlayerId, playerId, currentInnings, isPlayXi) => {
  //     setEditedPlayers(prevState => ({
  //         ...prevState,
  //         [commentaryPlayerId]: {
  //             ...prevState[commentaryPlayerId],
  //             playerId: playerId,
  //             currentInnings: currentInnings,
  //             isInPlayingEleven: isPlayXi,
  //         }
  //     }));
  //     setUpdatedPlayingXi(prevState => ({ ...prevState, [commentaryPlayerId]: isPlayXi }))
  // };

    useEffect(() => {
        if (!isEmpty(commentaryTeamPlayers)) {
            const tempTeamXiPlayers = updatedPlayingXiPlayer
            commentaryTeamPlayers.forEach(player => {
                if (!Object.keys(updatedPlayingXiPlayer).includes(player.commentaryPlayerId))
                    tempTeamXiPlayers[player.commentaryPlayerId] = player.isInPlayingEleven
            })
            setUpdatedPlayingXi(tempTeamXiPlayers)
        }
    }, [commentaryTeamPlayers])

    const playerTypeOrder = {
        BatsMan: 1,
        Wicketkeeper: 2,
        AllRounder: 3,
        Bowler: 4,
    };

    const imageRender = (playerType) => {
        if (playerType === "BatsMan") {
            return <img src={bat} alt="bat" style={{ width: "20px", height: "20px" }} />
        } else if (playerType === "Wicketkeeper") {
            return <img src={keeper} alt="keeper" style={{ width: "20px", height: "20px" }} />
        }
        else if (playerType === "AllRounder") {
            return <img src={allrounder} alt="allrounder" style={{ width: "20px", height: "20px" }} />
        } else {
            return <img src={ball} alt="ball" style={{ width: "20px", height: "20px" }} />
        }
    }

    const sortedData = commentaryTeamPlayers.sort((a, b) => {
        // Compare by playerType using the defined order
        const typeComparison = playerTypeOrder[a.playerType] - playerTypeOrder[b.playerType];
        if (typeComparison !== 0) return typeComparison;

        // If playerType is the same, compare by playerName alphabetically
        return (a?.playerName || "").localeCompare(b?.playerName || "");
    });

  const handleCheckPlayer = (
    commentaryPlayerId,
    playerId,
    currentInnings,
    isChecked
  ) => {
    if (isChecked) {
      const originalPlayer = commentaryTeamPlayers.find(
        (p) => p.commentaryPlayerId === commentaryPlayerId
      );
      setEditedPlayers((prevState) => ({
        ...prevState,
        [commentaryPlayerId]: {
          playerId: playerId,
          currentInnings: currentInnings,
          bowlingType: prevState[commentaryPlayerId]?.bowlingType ?? originalPlayer?.bowlingType,
          isInPlayingEleven:
            updatedPlayingXiPlayer[commentaryPlayerId] ??
            commentaryTeamPlayers.find(
              (p) => p.commentaryPlayerId === commentaryPlayerId
            )?.isInPlayingEleven,
        },
      }));
    } else {
      setEditedPlayers((prevState) => {
        const newState = { ...prevState };
        delete newState[commentaryPlayerId];
        return newState;
      });
    }
  };
  const getPlayerBowlingTypeValue = (player) => {
    const playerToCheck = editedPlayers[player.commentaryPlayerId]
      ? editedPlayers[player.commentaryPlayerId]
      : player;
    const selectedValue = bowlingType?.filter(
      (ele) => +ele.value === playerToCheck.bowlingType
    );
    // console.log("values: ", {
    //   selectedValue,
    //   editedPlayers,
    //   player,
    //   playerToCheck,
    // });
    return selectedValue;
  };
  return (
    <>
      {isLoading && <SpinnerModel />}
      <Row>
        <Col lg={8} className="my-1">
          <Select
            class="form-control"
            classNamePrefix="filter-dropdown"
            value={selectedPlayer || ""}
            onChange={(value) => {
              setSelectedPlayer(value);
            }}
            options={nonCommentaryTeamPlayers.map((player) => ({
              label: player?.playerName,
              value: player?.playerId,
            }))}
          />
        </Col>
        <Col
          id="addreloadicon"
          lg={4}
          className="my-1 d-flex justify-content-around"
        >
          <Button
            color="success"
            className="btn-sm px-3"
            id="create-btn"
            onClick={handleAddPlayer}
          >
            <i className="ri-add-line" style={{ width: "30px" }}></i>
          </Button>
          <div className="mx-1"></div>
          <Button
            color="primary"
            className="btn-sm px-3"
            onClick={handleReloadTeam}
          >
            <i class="ri-refresh-line"></i>
          </Button>
        </Col>
      </Row>
      <Row className="rounded py-3">
        <div class="row d-flex align-items-center my-2 ">
          {/* <div className="col-2"></div> Remove Pls Add After if you want to set Remove Delete Players*/}
          <div style={{ width: "100%"}}>
            <div className="row">
              <div style={{ width: "7%"}}></div>
              <div style={{ width: "5%"}}></div>
              <div style={{ width: "5%"}}></div>
              <div style={{ width: "10%"}}></div>
              <div style={{ width: "15%"}}>Player</div>
              <div style={{ width: "15%"}}>Bowling Style</div>
              <div style={{ width: "6%"}}>Avg</div>
              {/* <div style={{ width: "10%"}}>SR</div> */}
              <div style={{ width: "6%"}}>BDRY</div>
              <div style={{ width: "6%"}}>PBF</div>
              {/* <div style={{ width: "10%"}}>Delete</div> */}
              <div style={{ width: "10%"}}>XI</div>
              {/* <div style={{ width: "10%"}}>P-Event</div> */}
              <div style={{ width: "15%"}}>Date</div>
            </div>
          </div>
        </div>
        {sortedData?.map((player, index) => (
          <div key={index} class="row d-flex align-items-center my-2 ">
            <div style={{ width: "100%"}}>
              <div className="row">
                <div style={{ width: "7%"}} className="d-flex align-items-center justify-content-start gap-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chk_child"
                    value="option1"
                    checked={editedPlayers[player.commentaryPlayerId] || false}
                    onChange={(e) =>
                      handleCheckPlayer(
                        player.commentaryPlayerId,
                        player.playerId,
                        player.currentInnings,
                        e.target.checked
                      )
                    }
                  />
                  <span>{index + 1}</span>
                </div>
                <div style={{ width: "5%"}}>
                  {!player?.isPlayInEvent && <Button
                    color="soft-danger"
                    // disabled={
                    //   player?.isPlay ||
                    //   player?.isBatterOut ||
                    //   player?.onStrike === true ||
                    //   player?.onStrike === false ||
                    //   player?.isBatterRetir
                    // }
                    onClick={(e) => handleDeletePlayer(player.playerId)}
                  >
                    <i className="ri-delete-bin-2-line"></i>
                  </Button>}
                </div>
                <div style={{ width: "5%"}}>{imageRender(player?.playerType)}</div>
                <div style={{ width: "10%"}}>
                  {player?.jerseyPlayerImage ? (
                    <img
                      src={player.jerseyPlayerImage}
                      alt={player.name || "Player"}
                      className="avatar-xs"
                    />
                  ) : (
                    <Avatar src="#" alt="ET">
                      Image
                    </Avatar>
                  )}
                </div>
                <div className="playerNameScroll" style={{ width: "15%"}}>
                  {player?.isPlayInEvent ? <strong>{player?.playerName}</strong> : player?.playerName}
                </div>
                <div style={{ width: "15%"}}>
                  <Select
                    value={getPlayerBowlingTypeValue(player)}
                    placeholder="Bowling Style"
                    class="form-control"
                    // styles={{
                    //     control: (provided) => ({
                    //       ...provided,
                    //       width: 180,
                    //     }),
                    //   }}
                    onChange={(value) =>
                      handleBowlerStyleChange(
                        player.commentaryPlayerId,
                        player.playerId,
                        player.currentInnings,
                        value.value
                      )
                    }
                    options={bowlingType}
                    classNamePrefix="filter-dropdown"
                  />
                </div>
                <div style={{ width: "6%"}}>
                  <input
                    type="number"
                    style={{ width: "60px" }}
                    value={
                      editedPlayers[player.commentaryPlayerId]
                        ?.batsmanAverage == null
                        ? +player.batsmanAverage
                        : editedPlayers[player.commentaryPlayerId]
                            ?.batsmanAverage !== ""
                        ? +editedPlayers[player.commentaryPlayerId]
                            ?.batsmanAverage
                        : ""
                    }
                    onChange={(e) =>
                      handleAvgChange(
                        player.commentaryPlayerId,
                        player.playerId,
                        player.currentInnings,
                        e.target.value
                      )
                    }
                  />
                </div>
                {/* <div style={{ width: "10%"}}>
                                    <input
                                        type="number"
                                        style={{ width: "50px" }}
                                        value={
                                            editedPlayers[player.commentaryPlayerId]?.batsmanStrikeRate == null ? +player.batsmanStrikeRate : editedPlayers[player.commentaryPlayerId]?.batsmanStrikeRate !== "" ? +editedPlayers[player.commentaryPlayerId]?.batsmanStrikeRate : ""
                                        }
                                        onChange={(e) =>
                                            handleStrikeRateChange(
                                                player.commentaryPlayerId,
                                                player.playerId,
                                                player.currentInnings,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div> */}
                <div style={{ width: "6%"}}>
                  <input
                    type="number"
                    style={{ width: "50px" }}
                    value={
                      editedPlayers[player.commentaryPlayerId]?.boundary == null
                        ? +player.boundary
                        : editedPlayers[player.commentaryPlayerId]?.boundary !==
                          ""
                        ? +editedPlayers[player.commentaryPlayerId]?.boundary
                        : ""
                    }
                    onChange={(e) =>
                      handleBoundaryChange(
                        player.commentaryPlayerId,
                        player.playerId,
                        player.currentInnings,
                        e.target.value
                      )
                    }
                  />
                </div>
                <div style={{ width: "6%"}}>
                  <input
                    type="number"
                    style={{ width: "50px" }}
                    value={
                      editedPlayers[player.commentaryPlayerId]
                        ?.playerBallFaced == null
                        ? +player.playerBallFaced
                        : editedPlayers[player.commentaryPlayerId]
                            ?.playerBallFaced !== ""
                        ? +editedPlayers[player.commentaryPlayerId]
                            ?.playerBallFaced
                        : ""
                    }
                    onChange={(e) =>
                      handleBallFacedChange(
                        player.commentaryPlayerId,
                        player.playerId,
                        player.currentInnings,
                        e.target.value
                      )
                    }
                  />
                </div>
                {/* <div class="col-1">
                  <Button
                    color="soft-danger"
                    disabled={
                      player?.isPlay ||
                      player?.isBatterOut ||
                      player?.onStrike === true ||
                      player?.onStrike === false ||
                      player?.isBatterRetir
                    }
                    onClick={(e) => handleDeletePlayer(player.playerId)}
                  >
                    <i className="ri-delete-bin-2-line"></i>
                  </Button>
                </div> */}
                <div style={{ width: "10%"}}>
                  <div className="form-check form-switch form-switch-lg">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="customSwitchsizelg"
                      checked={
                        updatedPlayingXiPlayer[player.commentaryPlayerId] ==
                        null
                          ? player?.isInPlayingEleven
                          : updatedPlayingXiPlayer[player.commentaryPlayerId]
                      }
                      onChange={(e) => {
                        const commentaryPlayerId =
                          updatedPlayingXiPlayer[player.commentaryPlayerId] ==
                          null
                            ? player?.isInPlayingEleven
                            : updatedPlayingXiPlayer[player.commentaryPlayerId];
                        handlePlayingXiChange(
                          player.commentaryPlayerId,
                          player.playerId,
                          player.currentInnings,
                          !commentaryPlayerId
                        );
                      }}
                      value={
                        updatedPlayingXiPlayer[player.commentaryPlayerId] ==
                        null
                          ? player?.isInPlayingEleven
                          : updatedPlayingXiPlayer[player.commentaryPlayerId]
                      }
                    />
                  </div>
                </div>
                {/* <div style={{ width: "10%"}}>
                  <div className="form-check form-switch form-switch-lg">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="customSwitchsizelg"
                      checked={player?.isPlayInEvent}
                      disabled
                    />
                  </div>
                </div> */}
                <div style={{ width: "15%"}}>
                  {dateType?.value == 1
                    ? convertDateUTCToLocal2_24(player?.createdDate, "index")
                    : convertDateUtcFormat24(player?.createdDate, "index")
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </Row>
      <Button color="success" className="btn-sm px-3" onClick={handleSave}>
        Save
      </Button>
      {/* Modal for adding player to other innings */}
      <Modal isOpen={showInningsModal} toggle={handleCloseInningsModal} centered>
        <ModalHeader toggle={handleCloseInningsModal}>
          Add Player to Innings {inningstoAddPlayer[currentInningsIndex]}
        </ModalHeader>
        <ModalBody>
          <p>Do you want to add player <strong>{pendingPlayerData?.playerName}</strong> to innings <strong>{inningstoAddPlayer[currentInningsIndex]}</strong> as well?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseInningsModal}>
            No
          </Button>
          <Button color="primary" onClick={handleAddToOtherInnings}>
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TeamPlayerCard;