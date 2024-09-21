import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader, Row, Col } from 'reactstrap';
import CardComponent from '../CardComponent';
import SelectPlayerModal from './SelectPlayerModal';
import "../CommentaryCss.css";
import axiosInstance from '../../../Features/axios';
import { updateToastData } from '../../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../../components/Common/Const';
import SpinnerModel from "../../../components/Model/SpinnerModel";

const AwardModal = ({ commentaryId, onClose }) => {
    const [awards, setAwards] = useState([]);
    const [selectedAward, setSelectedAward] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [playerList, setPlayerList] = useState([]);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const dispatch = useDispatch()
    useEffect(() => {
        console.log({ selectedPlayers });
    })
    useEffect(() => {
        // Fetch awards data
        axiosInstance.post('/admin/award/all', { isActive: true })
            .then((response) => {
                const data = response?.result
                if (data) setAwards(data);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            })
        axiosInstance.post('/admin/commentary/byId', { commentaryId: commentaryId })
            .then((response) => {
                const data = response?.result
                if (data && data?.team1Players && data?.team1Players) {
                    const allPlayers = [...data.team1Players, ...data.team2Players];
                    setPlayerList(allPlayers);
                    // setAwards(data.result);
                }
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            })
    }, [commentaryId]);

    const handleAwardClick = (award) => {
        setSelectedAward(award);
        setShowPlayerModal(true);
    };

    const handlePlayerSelect = (player) => {
        console.log(player);
        setSelectedPlayers(prev => ({
            ...prev,
            [selectedAward.id]: player
        }));
        setShowPlayerModal(false);
    };

    const handleSubmit = () => {
        const submissionData = awards
            .filter(award => selectedPlayers[award.id])
            .map(award => {
                const player = selectedPlayers[award.id];
                return {
                    awardId: award.id,
                    awardName: award.name,
                    playerId: player.playerId,
                    playerName: player.playerName,
                    commentaryId: commentaryId
                };
            });

        console.log('Submission data:', submissionData);
        // Here you would typically send this data to your backend
        onClose(); // Close the modal after submission
    };

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={onClose}>
            <ModalHeader>
                Award Selection
            </ModalHeader>
            <ModalBody>
                {(isApiLoading) && <SpinnerModel />}
                <Row>
                    {awards.map((award) => (
                        <Col xs={6} md={4} lg={3} key={award.id} onClick={() => handleAwardClick(award)}>
                            <CardComponent
                                title={award.name}
                                name={selectedPlayers[award.id] ? selectedPlayers[award.id].playerName : "Select Player"}
                                bgColor={selectedPlayers[award.id] ? "#e0e0e0" : "#f0f0f0"}
                                onClickColor="#d0d0d0"
                                isPlayerName={true}
                            />
                        </Col>
                    ))}
                </Row>
                <Row className="mt-4">
                    <Col>
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleSubmit}
                        >
                            Submit Awards
                        </button>
                    </Col>
                </Row>
            </ModalBody>
            {showPlayerModal && (
                <SelectPlayerModal
                    isOpen={true}
                    toggle={() => {
                        setShowPlayerModal(false);
                        setSelectedAward(null);
                    }}
                    playerList={playerList}
                    selectPlayer={handlePlayerSelect}
                />
            )}
        </Modal>
    );
};

export default AwardModal;