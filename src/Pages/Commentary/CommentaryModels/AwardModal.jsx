import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalBody, ModalHeader, Row, Col, Input, Table, CardBody } from 'reactstrap';
import "../CommentaryCss.css";
import axiosInstance from '../../../Features/axios';
import { updateToastData } from '../../../Features/toasterSlice';
import { useDispatch } from 'react-redux';
import { ERROR } from '../../../components/Common/Const';
import SpinnerModel from "../../../components/Model/SpinnerModel";

// Internal Card Component
const CardComponent = ({ title, name, bgColor, onClick, isSelected }) => {
    return (
        <div role="button" className="card" style={{ width: '100%', maxWidth: '150px', margin: '5px' }}>
            <CardBody
                className="rounded"
                onClick={onClick}
                style={{
                    backgroundColor: bgColor,
                    opacity: isSelected ? 1 : 0.5,
                    border: `2px solid ${bgColor}`,
                    padding: '10px',
                    height: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {isSelected && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        padding: '2px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderBottom: '1px solid rgba(255,255,255,0.3)',
                    }}>
                        <span style={{
                            fontWeight: 600,
                            fontSize: '10px',
                            color: 'white',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {title}
                        </span>
                    </div>
                )}
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ marginTop: isSelected ? '20px' : 0 }}>
                    {isSelected ? (
                        <span style={{
                            fontWeight: 700,
                            fontSize: '16px',
                            color: 'white',
                            textAlign: 'center',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            {name}
                        </span>
                    ) : (
                        <span style={{
                            fontWeight: 700,
                            fontSize: '18px',
                            color: 'white',
                            textAlign: 'center',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            {title}
                        </span>
                    )}
                </div>
            </CardBody>
        </div>
    );
};

const AwardModal = ({ commentaryId, onClose }) => {
    const [awards, setAwards] = useState([]);
    const [selectedAward, setSelectedAward] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [playerList, setPlayerList] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();

    // Generate vibrant colors once when the component mounts
    const awardColors = useMemo(() => {
        return Array.from({ length: 50 }, () => {
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 50%, 40%)`;  // More saturated and darker
        });
    }, []);

    useEffect(() => {
        setIsApiLoading(true);
        // Fetch awards data
        axiosInstance.post('/admin/commentary/getAssignAward', { commentaryId })
            .then((response) => {
                const data = response?.result;
                if (data) setSelectedPlayers(data);
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });

        axiosInstance.post('/admin/commentary/awards', { isActive: true })
            .then((response) => {
                const data = response?.result;
                if (data) setAwards(data);
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });

        // Fetch players data
        axiosInstance.post('/admin/commentary/byId', { commentaryId: commentaryId })
            .then((response) => {
                const data = response?.result;
                if (data && data?.team1Players && data?.team2Players) {
                    const allPlayers = [...data.team1Players, ...data.team2Players];
                    setPlayerList(allPlayers);
                    setFilteredPlayers(allPlayers);
                }
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
    }, [commentaryId, dispatch]);

    useEffect(() => {
        const filtered = playerList.filter(player =>
            player.playerName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPlayers(filtered);
    }, [search, playerList]);

    const handleAwardClick = (award) => {
        setSelectedAward(award);
        setShowPlayerModal(true);
        setSearch("");
        setFilteredPlayers(playerList);
    };

    const handlePlayerSelect = (player) => {
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
        axiosInstance.post('/admin/commentary/assignAward', { comAwards: submissionData })
            .then((response) => onClose())
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });

        console.log('Submission data:', submissionData);
    };

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={onClose}>
            <ModalHeader toggle={onClose}>
                Award Selection
            </ModalHeader>
            <ModalBody>
                {isApiLoading && <SpinnerModel />}
                <Row className="justify-content-center">
                    {awards.map((award, index) => (
                        <Col xs={6} sm={4} md={3} key={award.id} className="mb-3">
                            <CardComponent
                                title={award.name}
                                name={selectedPlayers[award.id]?.playerName}
                                bgColor={awardColors[index % awardColors.length]}
                                onClick={() => handleAwardClick(award)}
                                isSelected={!!selectedPlayers[award.id]}
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

            {/* Internal Player Selection Modal */}
            <Modal isOpen={showPlayerModal} toggle={() => setShowPlayerModal(false)} className="player-select-modal">
                <ModalHeader toggle={() => setShowPlayerModal(false)}>
                    Select Player for {selectedAward?.name}
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Search player..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3"
                    />
                    <Table responsive>
                        <tbody>
                            {filteredPlayers.map((player) => (
                                <tr key={player.playerId} onClick={() => handlePlayerSelect(player)} style={{ cursor: 'pointer' }}>
                                    <td>{player.playerName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ModalBody>
            </Modal>
        </Modal>
    );
};

export default AwardModal;