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

const TeamPlayerCard = ({ teamDetails, commentaryId, fetchData }) => {
    const [commentaryTeamPlayers, setCommentaryTeamPlayers] = useState([]);
    const [nonCommentaryTeamPlayers, setNonCommentaryTeamPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [editedPlayers, setEditedPlayers] = useState({});
    const [updatedPlayingXiPlayer, setUpdatedPlayingXi] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        if (teamDetails?.commentaryTeamPlayers && teamDetails?.teamPlayers) {
            const teamPlayers = teamDetails?.commentaryTeamPlayers.filter((item)=>item?.playerId !== null && item?.playerName !== null);
            setCommentaryTeamPlayers(teamPlayers);
            const selectedIds = teamPlayers.map(player => player.playerId)
            setNonCommentaryTeamPlayers(teamPlayers.filter(player => !selectedIds.includes(player.playerId)))
        }
    }, [teamDetails]);

    const handleAddPlayer = async () => {
        const playerIndex = nonCommentaryTeamPlayers.findIndex(player => player.playerId === selectedPlayer?.value)
        if (playerIndex !== -1) {
            setIsLoading(true);
            await axiosInstance
                .post("/admin/commentary/addTeamPlayer", { commentaryId, teamId: teamDetails?.teamId, playerId: selectedPlayer?.value })
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
            const playerDataArray = Object.keys(editedPlayers).map(playerId => {
                let { batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven } = editedPlayers[playerId];
                if (!batsmanAverage) {
                    batsmanAverage = commentaryTeamPlayers.find((item) => +item.playerId === +playerId)?.batsmanAverage || 0
                }
                if (!batsmanStrikeRate) {
                    batsmanStrikeRate = commentaryTeamPlayers.find((item) => +item.playerId === +playerId)?.batsmanStrikeRate || 0
                }
                if (!boundary) {
                    boundary = commentaryTeamPlayers.find((item) => +item.playerId === +playerId)?.boundary || 0
                }
                if(!playerBallFaced) {
                    playerBallFaced = commentaryTeamPlayers.find((item) => +item.playerId === +playerId)?.playerBallFaced || 0
                }
                isInPlayingEleven = Object.keys(updatedPlayingXiPlayer).includes(playerId) ? isInPlayingEleven :
                    commentaryTeamPlayers.find((item) => +item.playerId === +playerId)?.isInPlayingEleven || false
                return { commentaryId, teamId: teamDetails?.teamId, playerId, batsmanAverage, batsmanStrikeRate, boundary, playerBallFaced, isInPlayingEleven };
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

    const handleAvgChange = (playerId, avg) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                batsmanAverage: +avg,
                isInPlayingEleven: prevState[playerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[playerId] ?? commentaryTeamPlayers.find(p => p.playerId === playerId)?.isInPlayingEleven
            }
        }));
    };

    const handleStrikeRateChange = (playerId, strikeRate) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                batsmanStrikeRate: +strikeRate,
                isInPlayingEleven: prevState[playerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[playerId] ?? commentaryTeamPlayers.find(p => p.playerId === playerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBoundaryChange = (playerId, bdry) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                boundary: +bdry,
                isInPlayingEleven: prevState[playerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[playerId] ?? commentaryTeamPlayers.find(p => p.playerId === playerId)?.isInPlayingEleven
            }
        }));
    };

    const handleBallFacedChange = (playerId, playerBallFaced) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                playerBallFaced: +playerBallFaced,
                isInPlayingEleven: prevState[playerId]?.isInPlayingEleven ?? updatedPlayingXiPlayer[playerId] ?? commentaryTeamPlayers.find(p => p.playerId === playerId)?.isInPlayingEleven
            }
        }));
    };

    const handlePlayingXiChange = (playerId, isPlayXi) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                isInPlayingEleven: isPlayXi,
            }
        }));
        setUpdatedPlayingXi(prevState => ({ ...prevState, [playerId]: isPlayXi }))
    };

    useEffect(() => {
        if (!isEmpty(commentaryTeamPlayers)) {
            const tempTeamXiPlayers = updatedPlayingXiPlayer
            commentaryTeamPlayers.forEach(player => {
                if (!Object.keys(updatedPlayingXiPlayer).includes(player.playerId))
                    tempTeamXiPlayers[player.playerId] = player.isInPlayingEleven
            })
            setUpdatedPlayingXi(tempTeamXiPlayers)
        }
    }, [commentaryTeamPlayers])
    return (
        <Card>
            {isLoading && <SpinnerModel />}
            <CardHeader>{teamDetails?.teamName}</CardHeader>
            <CardBody>
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
                    {commentaryTeamPlayers?.map((player, index) => (
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
                                                +editedPlayers[player.playerId]?.batsmanAverage ||
                                                +player.batsmanAverage
                                            }
                                            onChange={(e) =>
                                                handleAvgChange(player.playerId, e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="col-2">
                                        <input
                                            type="number"
                                            style={{ width: "55px" }}
                                            value={
                                                +editedPlayers[player.playerId]?.batsmanStrikeRate ||
                                                +player.batsmanStrikeRate
                                            }
                                            onChange={(e) =>
                                                handleStrikeRateChange(
                                                    player.playerId,
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
                                                +editedPlayers[player.playerId]?.boundary ||
                                                +player.boundary
                                            }
                                            onChange={(e) =>
                                                handleBoundaryChange(
                                                    player.playerId,
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
                                                +editedPlayers[player.playerId]?.playerBallFaced ||
                                                +player.playerBallFaced
                                            }
                                            onChange={(e) =>
                                                handleBallFacedChange(
                                                    player.playerId,
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
                                                checked={updatedPlayingXiPlayer[player.playerId]}
                                                onChange={(e) => {
                                                    handlePlayingXiChange(
                                                        player.playerId,
                                                        !updatedPlayingXiPlayer[player.playerId]
                                                    )
                                                }}
                                                value={updatedPlayingXiPlayer[player.playerId]}
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
            </CardBody>
        </Card>
    )
}

export default TeamPlayerCard