import React, { useEffect, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import ball from '../../../../src/assets/images/cricket-icons/cricket-ball.png';
import bat from '../../../../src/assets/images/cricket-icons/cricket-bat.png';
import allrounder from '../../../../src/assets/images/cricket-icons/cricket.png';
import keeper from '../../../../src/assets/images/cricket-icons/game.png';

const SelectPlayerModal = ({ playerList, toggle, isOpen, selectPlayer, isBowler, overPopUpForBowler }) => {
    if (playerList && playerList.length > 0) {
        playerList = playerList.sort((a, b) =>
            a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, { sensitivity: 'base' })
        );
    }
    const [players, setPlayers] = useState(playerList);
    const [isBowlerChange, setIsBowlerChange] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setSearch("");
        setPlayers(playerList);

    }, [isOpen, playerList]);
    useEffect(() => {
        setIsBowlerChange(isBowler)
    }, [isBowler]);

    useEffect(() => {
        const filteredPlayers = playerList?.filter(value => value.playerName?.toLowerCase().includes(search.toLowerCase()));
        setPlayers(filteredPlayers)
    }, [search])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const inputElement = document.getElementById('playerNameInput');
                if (inputElement) inputElement.focus();
            }, 150);
        }
    }, [isOpen]);

    const playerTypeOrder = {
        "BatsMan": 1,
        "Wicketkeeper": 2,
        "AllRounder": 3,
        "Bowler": 4
    };

    // Sort by player type first, then player name alphabetically
    let sortedPlayers = players?.sort((a, b) => {
        // First, compare by playerType
        const typeCompare = isBowlerChange ? playerTypeOrder[b.playerType] - playerTypeOrder[a.playerType] : playerTypeOrder[a.playerType] - playerTypeOrder[b.playerType];
        if (typeCompare !== 0) return typeCompare;
        // If playerType is the same, compare alphabetically by playerName
        return a.playerName.localeCompare(b.playerName);
    });
    sortedPlayers = sortedPlayers?.filter((player) => player.isInPlayingEleven)

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
    return (
        <Modal backdrop="static" keyboard={false} className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable >
            <ModalHeader toggle={!overPopUpForBowler ? toggle : null} >
                Select Player
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    <thead>
                        <Input
                            id="playerNameInput"
                            className="form-control mb-3"
                            type="text"
                            placeholder='Player Name'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </thead>
                    <tbody>
                        {sortedPlayers?.map(value => <tr key={value.commentaryPlayerId}>
                            <td role='button' onClick={() => {
                                setIsBowlerChange(false)
                                selectPlayer(value.commentaryPlayerId)
                            }}
                            ><span className='pe-4'>{imageRender(value.playerType)}</span>{value.playerName}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal >
    )
}

export default SelectPlayerModal