import React, { useState } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import CardComponent from '../CardComponent';
import { BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from '../CommentartConst';
import SelectPlayerModal from './SelectPlayerModal';
import "../CommentaryCss.css"

const OnPitchPlayerModal = ({ onPitchPlayers, players, updatePlayerOnParent, toggle }) => {
    const [playerList, setPlayerList] = useState(false);
    const [changePlayerType, setChangePlayerType] = useState(false);

    const onChangePlayerClick = (playerType) => {
        setPlayerList(players[playerType === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM])
        setChangePlayerType(playerType)
    }

    const onSubmitClick = (newPlayerId) => {
        const toReturn = onPitchPlayers
        let playerToAdd = {}
        playerList.map(player => {
            if (player.commentaryPlayerId === newPlayerId) playerToAdd = player
            return player
        })
        toReturn[changePlayerType] = playerToAdd
        setPlayerList(null)
        setChangePlayerType(null)
        updatePlayerOnParent(toReturn)
    }

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Player Selection
            </ModalHeader>
            <ModalBody>
                Missing Player :
                <Row>
                    {!onPitchPlayers[ON_STRIKE]?.playerName && <Col xs={6} md={6} lg={6} onClick={() => onChangePlayerClick(ON_STRIKE)}>
                        <CardComponent
                            title="Striker"
                            name="Striker"
                            bgColor={"#0BB197"}
                            onClickColor={"#007B64"}
                            isPlayerName={true}
                        />
                    </Col>}
                    {!onPitchPlayers[NON_STRIKE]?.playerName && <Col xs={6} md={6} lg={6} onClick={() => onChangePlayerClick(NON_STRIKE)}>
                        <CardComponent
                            title="Non-Striker"
                            name="Non-Striker"
                            bgColor={"#0BB197"}
                            onClickColor={"#007B64"}
                            isPlayerName={true}
                        />
                    </Col>}
                    {!onPitchPlayers[CURRENT_BOWLER]?.playerName && <Col xs={6} md={6} lg={6} onClick={() => onChangePlayerClick(CURRENT_BOWLER)}>
                        <CardComponent
                            title="Bowler"
                            name="Bowler"
                            bgColor={"#FCC042"}
                            onClickColor={"#CB8F00"}
                            isPlayerName={true}
                        />
                    </Col>}
                </Row>
            </ModalBody>
            {changePlayerType &&
                <SelectPlayerModal
                    isOpen={true}
                    toggle={() => {
                        setPlayerList(null)
                        setChangePlayerType(null)
                    }}
                    playerList={playerList}
                    selectPlayer={onSubmitClick}
                />}
        </Modal >
    )
}

export default OnPitchPlayerModal