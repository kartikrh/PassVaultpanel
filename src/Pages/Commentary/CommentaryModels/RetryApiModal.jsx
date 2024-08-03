import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
import axiosInstance from '../../../Features/axios';

const RetryApiModal = ({ onExit, errorMessage, onRetryClick, logApi }) => {
    const retryApiData = async () => {
        await axiosInstance.post('/admin/tabs/byId', { generatedFrom: errorMessage, Comment: logApi })
            .then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
        onRetryClick()
    }
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={onExit} >
            <ModalHeader>
                Retry Action
            </ModalHeader>
            <ModalBody>
                Due to some reasons, your last action has failed, please retry it by clicking on Retry button.
                Following Error Occured :-
                <span>Message: {errorMessage} </span>
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={retryApiData}>Retry</Button>
            </ModalFooter>
        </Modal >
    )
}

export default RetryApiModal