import React, { useEffect, useState } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import CardComponent from '../CardComponent';
import { BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from '../CommentartConst';
import SelectPlayerModal from './SelectPlayerModal';
import "../CommentaryCss.css"

const OnPitchPlayerModal = ({ onPitchPlayers, players, updatePlayerOnParent, toggle }) => {
    const [playerList, setPlayerList] = useState(false);
    const [isBowlerrChange, setIsBowlerrChange] = useState(false);
    const [changePlayerType, setChangePlayerType] = useState(false);

    const onChangePlayerClick = (playerType) => {
        setPlayerList(players[playerType === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM]
            ?.filter((player) => {
                if (playerType === CURRENT_BOWLER)
                    return player.isPlay === null
                else return player.isPlay === null && player.isBatterOut !== true
            }))
        setChangePlayerType(playerType)
    }

    const onSubmitClick = (newPlayerId) => {
        let playerToAdd = {}
        playerList.map(player => {
            if (player.commentaryPlayerId === newPlayerId) playerToAdd = {
                ...player,
                isPlay: true,
                onStrike: changePlayerType === ON_STRIKE ? true : false
            }
            return player
        })
        setPlayerList(null)
        setChangePlayerType(null)
        updatePlayerOnParent(changePlayerType, playerToAdd)
        setIsBowlerrChange(false)
    }
    
    useEffect(() => {
        if(onPitchPlayers[CURRENT_BOWLER] === null) {
            setIsBowlerrChange(true)
        }else if(onPitchPlayers[CURRENT_BOWLER]){
            setIsBowlerrChange(false)
        }
    }, [onPitchPlayers])

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} keyboard={false} toggle={toggle} >
            <ModalHeader>
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
                    isBowler = {isBowlerrChange}
                    playerList={playerList}
                    selectPlayer={onSubmitClick}
                />}
        </Modal >
    )
}

export default OnPitchPlayerModal