import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Select from "react-select";
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../components/Common/Const';
import SpinnerModel from "../../components/Model/SpinnerModel";
import "./CommentaryCss.css";

const TeamPlayerCard = ({ teamDetails, commentaryId }) => {
    const [commentaryTeamPlayers, setCommentaryTeamPlayers] = useState([]);
    const [nonCommentaryTeamPlayers, setNonCommentaryTeamPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (teamDetails?.commentaryTeamPlayers && teamDetails?.teamPlayers) {
            setCommentaryTeamPlayers(teamDetails.commentaryTeamPlayers);
            const selectedIds = teamDetails.commentaryTeamPlayers.map(player => player.playerId)
            setNonCommentaryTeamPlayers(teamDetails.teamPlayers.filter(player => !selectedIds.includes(player.playerId)))
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

    const handleDeletePlayer = async (playerId) => {
        const playerIndex = commentaryTeamPlayers.findIndex(player => player.playerId === playerId)
        if (playerIndex !== -1) {
            setIsLoading(true);
            await axiosInstance
                .post("/admin/commentary/deleteTeamPlayer", { commentaryId, teamId: teamDetails?.teamId, playerId: playerId })
                .then((response) => {
                    setIsLoading(false);
                    setNonCommentaryTeamPlayers(prev => [...prev, { teamId: teamDetails?.teamId, playerId: playerId, playerName: commentaryTeamPlayers[playerIndex].playerName }])
                    setCommentaryTeamPlayers(prev => [...prev.slice(0, playerIndex), ...prev.slice(playerIndex + 1)])
                })
                .catch((error) => {
                    dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    setIsLoading(false);
                });
        }
    }

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
                            <i className="ri-add-line" style={{width: "30px"}} ></i>
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
                    {commentaryTeamPlayers?.map((player, index) => (
                        <div key={index} class="row d-flex align-items-center my-2 ">
                            <div class="col-2">
                                <Button
                                    color="soft-danger"
                                    onClick={(e) => handleDeletePlayer(player.playerId)}
                                >
                                    <i className="ri-delete-bin-2-line"></i>
                                </Button>
                            </div>
                            <div class="col-10 ps-4">
                                {player?.playerName}
                            </div>
                        </div>)
                    )}
                </Row>
            </CardBody>
        </Card>
    )
}

export default TeamPlayerCard