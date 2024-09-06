import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
export const RetryModel = ({ errorMsg }) => {
    const handleRefresh = () => {
        window.location.reload();
    };
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} >
            <ModalHeader >
                Warning
            </ModalHeader>
            <ModalBody>
                There is some error in the commentary, please click on retry to continue scoring.
                <p><b>Error : </b>{errorMsg}</p>
            </ModalBody>
            <ModalFooter>
                {/* <Button color="danger" className="decision-Button float-left" onClick={toggle}>Exit</Button> */}
                <Button color="success" className="decision-Button" onClick={() => handleRefresh()}>Retry</Button>
            </ModalFooter>
        </Modal>
    )
}