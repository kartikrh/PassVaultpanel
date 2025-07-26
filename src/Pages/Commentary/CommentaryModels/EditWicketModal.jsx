import React, { useEffect, useState } from 'react'
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
import axiosInstance from '../../../Features/axios';
import SpinnerModel from "../../../components/Model/SpinnerModel";
import { BOWLING_TEAM } from '../CommentartConst';
import { element } from 'prop-types';

const EditWicketDetails = ({ onClose, ballId, playersList }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [wicketData, setWicketData] = useState(false)
    const fielderList = playersList[BOWLING_TEAM]?.map(element => {
        return { label: element.playerName, value: element.commentaryPlayerId }
    })
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post(
                    "/admin/commentary/commWicketById",
                    { commentaryWicketId: ballId }
                );
                if (response?.result) {
                    setWicketData(response?.result)
                }
            } catch (error) {
                console.error("Error fetching market data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData()
        console.log(playersList)
    }, [])
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} onClose={onClose} >
            <ModalHeader>
                Edit Wicket Details
            </ModalHeader>
            {isLoading ? <SpinnerModel /> : <ModalBody>
                What do you want to Edit:
            </ModalBody>}
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button"
                    onClick={() => { console.log("Update Ball API") }}>Save</Button>
                <Button color="danger" className="decision-Button text-right" onClick={() => onClose()}>Close</Button>
            </ModalFooter>
        </Modal >
    )
}

export default EditWicketDetails