import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Select from "react-select";
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../components/Common/Const';
import SpinnerModel from "../../components/Model/SpinnerModel";
import "./CommentaryCss.css";

const TeamPlayerCard = ({ teamDetails, commentaryId, fetchData }) => {
    const [commentaryTeamPlayers, setCommentaryTeamPlayers] = useState([]);
    const [nonCommentaryTeamPlayers, setNonCommentaryTeamPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [editedPlayers, setEditedPlayers] = useState({});
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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const playerDataArray = Object.keys(editedPlayers).map(playerId => {
                let { batsmanAverage, batsmanStrikeRate } = editedPlayers[playerId];
                if(!batsmanAverage){
                    batsmanAverage = commentaryTeamPlayers.find((item)=>+item.playerId === +playerId)?.batsmanAverage || 0
                }
                if(!batsmanStrikeRate){
                    batsmanStrikeRate = commentaryTeamPlayers.find((item)=>+item.playerId === +playerId)?.batsmanStrikeRate || 0
                }
                return { commentaryId, teamId: teamDetails?.teamId, playerId, batsmanAverage, batsmanStrikeRate };
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
            }
        }));
    };

    const handleStrikeRateChange = (playerId, strikeRate) => {
        setEditedPlayers(prevState => ({
            ...prevState,
            [playerId]: {
                ...prevState[playerId],
                batsmanStrikeRate: +strikeRate,
            }
        }));
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
                <div class="row d-flex align-items-center my-2 ">
                  <div class="col-2"></div>
                  <div class="col-10 ps-4">
                    <div className="row">
                       <div className="col-6">Player</div>
                       <div className="col-3">Avg</div>
                       <div className="col-3">SR</div>
                    </div>
                  </div>
                  </div>
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
                           <div className="row">
                             <div className="col-6">{player?.playerName}</div>
                             <div className="col-3">
                               <input
                                 type="number"
                                 style={{ width: "65px" }}
                                 value={
                                   +editedPlayers[player.playerId]?.batsmanAverage ||
                                   +player.batsmanAverage
                                 }
                                 onChange={(e) =>
                                   handleAvgChange(player.playerId, e.target.value)
                                 }
                               />
                             </div>
                             <div className="col-3">
                               <input
                                 type="number"
                                 style={{ width: "65px" }}
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