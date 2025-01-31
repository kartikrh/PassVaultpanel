import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Select from "react-select";
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../components/Common/Const';
import SpinnerModel from "../../components/Model/SpinnerModel";
import "./CommentaryCss.css";
import { isEmpty } from 'lodash';
import ball from '../../../src/assets/images/cricket-icons/cricket-ball.png';
import bat from '../../../src/assets/images/cricket-icons/cricket-bat.png';
import allrounder from '../../../src/assets/images/cricket-icons/cricket.png';
import keeper from '../../../src/assets/images/cricket-icons/game.png';

const TeamPlayerCard = ({ commentaryId, teamDetails, inningPlayers, fetchData }) => {
    const [commentaryTeamPlayers, setCommentaryTeamPlayers] = useState([]);
    const [nonCommentaryTeamPlayers, setNonCommentaryTeamPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [editedPlayers, setEditedPlayers] = useState({});
    const [updatedPlayingXiPlayer, setUpdatedPlayingXi] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        if (inningPlayers && teamDetails?.teamPlayers) {
            const teamPlayers = inningPlayers.filter((item) => item?.playerId !== null && item?.playerName !== null);
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
                .post("/admin/commentary/addTeamPlayer", { commentaryId, teamId: teamDetails?.teamId, playerId: selectedPlayer?.value, currentInnings: inningPlayers?.[0]?.currentInnings })
                .then((response) => {
                    setCommentaryTeamPlayers(prev => [...prev, { teamId: teamDetails?.teamId, playerId: selectedPlayer?.value, playerName: nonCommentaryTeamPlayers[playerIndex].playerName }])
                    setNonCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)])
                    setSelectedPlayer(undefined);
                    fetchData(commentaryId);
                    setIsLoading(false);
                })
                .catch((error) => {
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    setIsLoading(false);
                });
        }
    }

    // const handleDeletePlayer = async (playerId) => {
    //     const playerIndex = commentaryTeamPlayers.findIndex(player => player.playerId === playerId)
    //     if (playerIndex !== -1) {
    //         setIsLoading(true);
    //         await axiosInstance
    //             .post("/admin/commentary/deleteTeamPlayer", { commentaryId, teamId: teamDetails?.teamId, playerId: playerId })
    //             .then((response) => {
    //                 setIsLoading(false);
    //                 setNonCommentaryTeamPlayers(prev => [...prev, { teamId: teamDetails?.teamId, playerId: playerId, playerName: commentaryTeamPlayers[playerIndex].playerName }])
    //                 setCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)])
    //             })
    //             .catch((error) => {
    //                 dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    //                 setIsLoading(false);
    //             });
    //     }
    // }

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
                let { batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven, playerId, currentInnings } = editedPlayers[commentaryPlayerId];
                if (!batsmanAverage) {
                    batsmanAverage = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.batsmanAverage || 0
                }
                if (!batsmanStrikeRate) {
                    batsmanStrikeRate = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.batsmanStrikeRate || 0
                }
                if (!boundary) {
                    boundary = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.boundary || 0
                }
                if (!playerBallFaced) {
                    playerBallFaced = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.playerBallFaced || 0
                }
                isInPlayingEleven = Object.keys(updatedPlayingXiPlayer).includes(commentaryPlayerId) ? isInPlayingEleven :
                    commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.isInPlayingEleven || false
                return { commentaryId, teamId: teamDetails?.teamId, playerId, batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven, commentaryPlayerId: +commentaryPlayerId, currentInnings: +currentInnings };
            });
            await axiosInstance.post("/admin/commentary/updateTeamPlayer", playerDataArray);
            fetchData(commentaryId);
            setIsLoading(false);
            setEditedPlayers({});
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            setIsLoading(false);
        }
    };

    const handleAvgChange = (commentaryPlayerId, playerId, currentInnings, avg) => {
        const newAvg = (avg === null || avg === "") ? "" : avg
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                batsmanAverage: newAvg,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
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
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                boundary: newBdry,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBallFacedChange = (commentaryPlayerId, playerId, currentInnings, playerBallFaced) => {
        const newPlayerBallFaced = (playerBallFaced === null || playerBallFaced === "") ? "" : playerBallFaced
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                playerBallFaced: newPlayerBallFaced,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handlePlayingXiChange = (commentaryPlayerId, playerId, currentInnings, isPlayXi) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: isPlayXi,
            }
        }));
        setUpdatedPlayingXi(prevState => ({ ...prevState, [commentaryPlayerId]: isPlayXi }))
    };

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
        return a.playerName.localeCompare(b.playerName);
    });

    return (
        <>
            {isLoading && <SpinnerModel />}
            <Row>
                <Col lg={8} className="my-1">
                    <Select
                        class="form-control"
                        value={selectedPlayer || ""}
                        onChange={(value) => {
                            setSelectedPlayer(value);
                        }}
                        options={nonCommentaryTeamPlayers.map(player => ({
                            label: player?.playerName,
                            value: player?.playerId,
                        }))}
                    />
                </Col>
                <Col id="addreloadicon" lg={4} className="my-1 d-flex justify-content-around">
                    <Button
                        color="success"
                        className="btn-sm px-3"
                        id="create-btn"
                        onClick={handleAddPlayer}
                    >
                        <i className="ri-add-line" style={{ width: "30px" }} ></i>
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
                    <div class="col-12 ps-4">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className="col-3">Player</div>
                            <div className="col-2">Avg</div>
                            <div className="col-1">SR</div>
                            <div className="col-2">BDRY</div>
                            <div className="col-2">PBF</div>
                            <div className="col-1">XI</div>
                        </div>
                    </div>
                </div>
                {sortedData?.map((player, index) => (
                    <div key={index} class="row d-flex align-items-center my-2 ">
                        {/* <div class="col-2">
                                <Button
                                    color="soft-danger"
                                    onClick={(e) => handleDeletePlayer(player.playerId)}
                                >
                                    <i className="ri-delete-bin-2-line"></i>
                                </Button>
                            </div> */}
                        <div class="col-12 ps-4">
                            <div className="row">
                                <div className="col-1">{imageRender(player?.playerType)}</div>
                                <div className="col-3 playerNameScroll">{player?.playerName}</div>
                                <div className="col-2">
                                    <input
                                        type="number"
                                        style={{ width: "60px" }}
                                        value={
                                            editedPlayers[player.commentaryPlayerId]?.batsmanAverage == null ? +player.batsmanAverage : editedPlayers[player.commentaryPlayerId]?.batsmanAverage !== "" ? +editedPlayers[player.commentaryPlayerId]?.batsmanAverage : ""
                                        }
                                        onChange={(e) =>
                                            handleAvgChange(player.commentaryPlayerId, player.playerId, player.currentInnings, e.target.value)
                                        }
                                    />
                                </div>
                                <div className="col-1">
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
                                </div>
                                <div className="col-2">
                                    <input
                                        type="number"
                                        style={{ width: "50px"}}
                                        value={
                                            editedPlayers[player.commentaryPlayerId]?.boundary == null ? +player.boundary : editedPlayers[player.commentaryPlayerId]?.boundary !== "" ? +editedPlayers[player.commentaryPlayerId]?.boundary : ""
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
                                <div className="col-2">
                                    <input
                                        type="number"
                                        style={{ width: "55px" }}
                                        value={
                                            editedPlayers[player.commentaryPlayerId]?.playerBallFaced == null ? +player.playerBallFaced : editedPlayers[player.commentaryPlayerId]?.playerBallFaced !== "" ? +editedPlayers[player.commentaryPlayerId]?.playerBallFaced : ""
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
                                <div className="col-1">
                                    <div className="form-check form-switch form-switch-lg">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="customSwitchsizelg"
                                            checked={updatedPlayingXiPlayer[player.commentaryPlayerId] == null ? player?.isInPlayingEleven : updatedPlayingXiPlayer[player.commentaryPlayerId]}
                                            onChange={(e) => {
                                                const commentaryPlayerId = updatedPlayingXiPlayer[player.commentaryPlayerId] == null ? player?.isInPlayingEleven : updatedPlayingXiPlayer[player.commentaryPlayerId]
                                                handlePlayingXiChange(
                                                    player.commentaryPlayerId,
                                                    player.playerId,
                                                    player.currentInnings,
                                                    !commentaryPlayerId
                                                )
                                            }}
                                            value={updatedPlayingXiPlayer[player.commentaryPlayerId] == null ? player?.isInPlayingEleven : updatedPlayingXiPlayer[player.commentaryPlayerId]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)
                )}
            </Row>
            <Button
                color="success"
                className="btn-sm px-3"
                onClick={handleSave}
            >
                Save
            </Button>
        </>
    )
}

export default TeamPlayerCard