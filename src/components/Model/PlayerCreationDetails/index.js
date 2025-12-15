import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export const PlayerCreationDetails = ({ isOpen, toggle, createdDetailsData, playerId }) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="md" centered>
            <ModalHeader toggle={toggle}>Player Creation Details{" "}  {playerId ? `(${playerId})` : ""}</ModalHeader>
            <ModalBody>
                <div className="p-2">
                    <div className="mb-1">
                        <strong>Player Name:</strong>
                        <span className="ms-2">{createdDetailsData?.playerName || "N/A"}</span>
                    </div>
                    <div className="mb-1">
                        <strong>Created Date:</strong>
                        <span className="ms-2">
                            {createdDetailsData?.createdDate
                                ? new Date(createdDetailsData.createdDate).toLocaleString()
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="mb-1">
                        <strong>Created By:</strong>
                        <span className="ms-2">{createdDetailsData?.createdBy || 'N/A'}</span>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>
                    OK
                </Button>
            </ModalFooter>
        </Modal>
    );
};
