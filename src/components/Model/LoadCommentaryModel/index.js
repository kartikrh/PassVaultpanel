import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
    loadModelVisable,
    setLoadModelVisable,
    handleLoad,
}) => {
    return (
        <Modal
            isOpen={loadModelVisable}
            toggle={() => {
                setLoadModelVisable(false);
            }}
            centered
        >
            <ModalHeader
                className="bg-light p-3"
                id="exampleModalLabel"
                toggle={() => {
                    setLoadModelVisable(false);
                }}
            >
                Load Commentary
            </ModalHeader>
            <div className="tablelist-form">
                <ModalBody>
                    <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        id="modal-id"
                    >
                        <span className="mt-4 mb-4">
                            Are you sure you want to load commentary for selected?
                        </span>
                        <div className="hstack gap-2 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => {
                                    setLoadModelVisable(false);
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="btn btn-danger"
                                id="add-btn"
                                onClick={() => {
                                    handleLoad();
                                }}
                            >
                                Load
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default Index;
