import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
import { NON_STRIKE, ON_STRIKE, PLAYER_LIST, PREV_NON_STRIKE, PREV_ON_STRIKE, RETIRED_HURT_BATTER } from '../CommentartConst';
import SelectPlayerModal from './SelectPlayerModal';
const RetiredHurtModal = ({ toggle, onsubmit, onPitchplayers, playerList, allBattingPlayers, retiringHurtPartnership }) => {
    const [changePlayerType, setChangePlayerType] = useState(false);

    const onSubmitClick = (newPlayerId) => {
        const oldPlayer = onPitchplayers[changePlayerType]
        let toSend = {
            ...onPitchplayers,
            [RETIRED_HURT_BATTER]: { ...oldPlayer, "isPlay": null, "onStrike": null },
            [PREV_ON_STRIKE]: onPitchplayers[ON_STRIKE],
            [PREV_NON_STRIKE]: onPitchplayers[NON_STRIKE],
        }
        toSend[PLAYER_LIST] = allBattingPlayers.map(player => {
            let updatedPlayer = player
            if (player.commentaryPlayerId === newPlayerId) {
                updatedPlayer = {
                    ...player,
                    "isPlay": true,
                    "onStrike": changePlayerType === ON_STRIKE ? true : null
                }
                toSend[changePlayerType] = updatedPlayer
            }
            if (player.commentaryPlayerId === oldPlayer.commentaryPlayerId) { updatedPlayer = toSend[RETIRED_HURT_BATTER] }
            return updatedPlayer
        })
        setChangePlayerType(null)
        // console.log({ toSend });
        onsubmit(toSend)
    }

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader>
                Retired Hurt
            </ModalHeader>
            <ModalBody>
                Please select a batter:
                <Row>
                    <Col xs={6} md={6} lg={6} onClick={() => {setChangePlayerType(ON_STRIKE); retiringHurtPartnership()}}>
                        <CardComponent
                            title={onPitchplayers?.[ON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                        />
                    </Col>
                    <Col xs={6} md={6} lg={6} onClick={() => {setChangePlayerType(NON_STRIKE); retiringHurtPartnership()}}>
                        <CardComponent
                            title={onPitchplayers?.[NON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                        />
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
            </ModalFooter>
            {changePlayerType &&
                <SelectPlayerModal
                    isOpen={true}
                    toggle={() => {
                        setChangePlayerType(null)
                    }}
                    playerList={playerList}
                    selectPlayer={onSubmitClick}
                />}
        </Modal >
    )
}

export default RetiredHurtModal