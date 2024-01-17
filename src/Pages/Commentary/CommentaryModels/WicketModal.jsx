import React, { useEffect, useRef } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormBuilder from '../../../components/Common/Reusables/FormBuilder';
import { WICKET_FIELDS } from './WicketModalFieldConst';
import { NON_STRIKE, ON_STRIKE } from '../CommentartConst';
const WicketModal = ({ onPitchPlayers, bowlingTeam, toggle, isOpen, onSubmit }) => {
    const finalizeRef = useRef(null);
    const bowlingPlayerList = []
    const battersOptions = []
    useEffect(() => {
        bowlingTeam?.map(element => {
            bowlingPlayerList.push({ label: element.playerName, value: element.playerId })
        })
    }, [bowlingTeam])
    useEffect(() => {
        battersOptions.push({ label: onPitchPlayers?.[ON_STRIKE]?.playerName, value: onPitchPlayers?.[ON_STRIKE]?.playerId })
        battersOptions.push({ label: onPitchPlayers?.[NON_STRIKE]?.playerName, value: onPitchPlayers?.[NON_STRIKE]?.playerId })
    }, [onPitchPlayers])
    const handleSubmit = () => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            onSubmit(dataToSave)
        }
    }
    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Wicket
            </ModalHeader>
            <ModalBody>
                <FormBuilder
                    ref={finalizeRef}
                    fields={WICKET_FIELDS}
                    masterData={{ fielder: bowlingPlayerList, batterId: battersOptions }}
                    editFormData={{}}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={handleSubmit}>Wicket</Button>
                <Button color="danger" className="decision-Button text-right " onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    )
}

export default WicketModal