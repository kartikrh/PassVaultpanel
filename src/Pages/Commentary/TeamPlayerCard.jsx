import React, { useEffect, useState } from 'react';
import { Button, Card, CardHeader } from 'reactstrap';
import Select from "react-select";
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../components/Common/Const';
import SpinnerModel from "../../components/Model/SpinnerModel";

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

    const handleReloadTeam = async (commentaryId) => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/commentary/reloadTeamAndPlayerById", { commentaryId, teamId: teamDetails?.teamId })
            .then((response) => {
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
            });
    };

    return (
        <Card>
            <CardHeader>
                {isLoading && <SpinnerModel />}
                {teamDetails?.teamName}
                <div class="row card-body">
                    <div class="col mb-1 mb-lg-0 mb-md-0 mb-sm-1">
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
                    </div>
                    <div class="col-auto">
                        <Button
                            color="success"
                            className="add-btn"
                            id="create-btn"
                            onClick={handleAddPlayer}
                        >
                            <i className="ri-add-line align-bottom me-1"></i>{" "}
                            Add
                        </Button>
                    </div>
                    <div class="col-auto">
                        <Button
                            color={"primary"}
                            className="btn"
                            onClick={handleReloadTeam}
                        >
                            Reload
                        </Button>
                    </div>
                </div>
                <div class="rounded row border border-secondary card-body mx-3 mb-3">
                    {commentaryTeamPlayers?.map((player, index) => (
                        <div key={index} class="row d-flex align-items-center my-1">
                            <div class="col-6">
                                {player?.playerName}
                            </div>
                            <div class="col-6 d-flex justify-content-end">
                                <button type="button" class="btn btn-primary" onClick={(e) => handleDeletePlayer(player.playerId)}>Delete</button>
                            </div>
                        </div>)
                    )}
                </div>
            </CardHeader>
        </Card>
    )
}

export default TeamPlayerCard