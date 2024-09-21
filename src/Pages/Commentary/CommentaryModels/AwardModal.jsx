import React, { useState, useEffect } from 'react';
import SelectPlayerModal from './SelectPlayerModal';

const AwardSelectionComponent = ({ commentaryId, onClose }) => {
    const [awards, setAwards] = useState([]);
    const [selectedAward, setSelectedAward] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [playerList, setPlayerList] = useState([]);
    const [showPlayerModal, setShowPlayerModal] = useState(false);

    useEffect(() => {
        // Fetch awards data
        fetch('/admin/award/all')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setAwards(data.result);
                }
            })
            .catch(error => console.error('Error fetching awards:', error));

        // Fetch players data
        fetch(`/admin/commentary/byId?id=${commentaryId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const allPlayers = [...data.result.team1Players, ...data.result.team2Players];
                    setPlayerList(allPlayers);
                }
            })
            .catch(error => console.error('Error fetching players:', error));
    }, [commentaryId]);

    const handleAwardClick = (award) => {
        setSelectedAward(award);
        setShowPlayerModal(true);
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

        console.log('Submission data:', submissionData);
        // Here you would typically send this data to your backend
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Awards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {awards.map((award) => (
                    <div
                        key={award.id}
                        className="border rounded p-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
                        onClick={() => handleAwardClick(award)}
                        style={{ backgroundColor: selectedPlayers[award.id] ? '#e0e0e0' : '#f0f0f0', opacity: 0.6 }}
                    >
                        {selectedPlayers[award.id] ? (
                            <>
                                <p className="text-sm text-gray-600 mb-2">{award.name}</p>
                                <p className="text-lg font-semibold">{selectedPlayers[award.id].playerName}</p>
                            </>
                        ) : (
                            <p className="text-center">{award.name}</p>
                        )}
                    </div>
                ))}
            </div>

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

            <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleSubmit}
            >
                Submit Awards
            </button>
        </div>
    );
};

export default AwardSelectionComponent;