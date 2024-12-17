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
            const teamPlayers = inningPlayers.filter((item)=>item?.playerId !== null && item?.playerName !== null);
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
                if(!playerBallFaced) {
                    playerBallFaced = commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.playerBallFaced || 0
                }
                isInPlayingEleven = Object.keys(updatedPlayingXiPlayer).includes(commentaryPlayerId) ? isInPlayingEleven :
                    commentaryTeamPlayers.find((item) => +item.commentaryPlayerId === +commentaryPlayerId)?.isInPlayingEleven || false
                return { commentaryId, teamId: teamDetails?.teamId, playerId , batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven, commentaryPlayerId: +commentaryPlayerId, currentInnings: +currentInnings };
            });
            await axiosInstance.post("/admin/commentary/updateTeamPlayer", playerDataArray);
            setIsLoading(false);
            fetchData(commentaryId);
            setEditedPlayers({});
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            setIsLoading(false);
        }
    };

    const handleAvgChange = (commentaryPlayerId, playerId, currentInnings, avg) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                batsmanAverage: +avg,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleStrikeRateChange = (commentaryPlayerId, playerId, currentInnings, strikeRate) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                batsmanStrikeRate: +strikeRate,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBoundaryChange = (commentaryPlayerId, playerId, currentInnings, bdry) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                boundary: +bdry,
                playerId: playerId,
                currentInnings: currentInnings,
                isInPlayingEleven: prevState[commentaryPlayerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[commentaryPlayerId] ?? commentaryTeamPlayers.find(p => p.commentaryPlayerId === commentaryPlayerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBallFacedChange = (commentaryPlayerId, playerId, currentInnings, playerBallFaced) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [commentaryPlayerId]: {
                ...prevState[commentaryPlayerId],
                playerBallFaced: +playerBallFaced,
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
                                <div className="col-3">Player</div>
                                <div className="col-2">Avg</div>
                                <div className="col-2">SR</div>
                                <div className="col-2">BDRY</div>
                                <div className="col-2">PBF</div>
                                <div className="col-1">XI</div>

                            </div>
                        </div>
                    </div>
                    {commentaryTeamPlayers?.sort((a,b)=>a.commentaryPlayerId - b.commentaryPlayerId)?.map((player, index) => (
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
                                    <div className="col-3">{player?.playerName}</div>
                                    <div className="col-2">
                                        <input
                                            type="number"
                                            style={{ width: "55px" }}
                                            value={
                                                +editedPlayers[player.commentaryPlayerId]?.batsmanAverage ||
                                                +player.batsmanAverage
                                            }
                                            onChange={(e) =>
                                                handleAvgChange(player.commentaryPlayerId, player.playerId, player.currentInnings, e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="col-2">
                                        <input
                                            type="number"
                                            style={{ width: "55px" }}
                                            value={
                                                +editedPlayers[player.commentaryPlayerId]?.batsmanStrikeRate ||
                                                +player.batsmanStrikeRate
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
                                            style={{ width: "55px" }}
                                            value={
                                                +editedPlayers[player.commentaryPlayerId]?.boundary ||
                                                +player.boundary
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
                                                +editedPlayers[player.commentaryPlayerId]?.playerBallFaced ||
                                                +player.playerBallFaced
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
                                                checked={updatedPlayingXiPlayer[player.commentaryPlayerId]}
                                                onChange={(e) => {
                                                    handlePlayingXiChange(
                                                        player.commentaryPlayerId,
                                                        player.playerId,
                                                        player.currentInnings,
                                                        !updatedPlayingXiPlayer[player.commentaryPlayerId]
                                                    )
                                                }}
                                                value={updatedPlayingXiPlayer[player.commentaryPlayerId]}
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