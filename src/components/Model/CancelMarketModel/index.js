import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  closeModelVisible,
  setCloseModelVisable,
  handleClose,
  singleCheck,
}) => {
  const [modal_close, setModal_close] = useState(true);
  function tog_close() {
    setModal_close(!modal_close);
  }
  return (
    <Modal
      isOpen={closeModelVisible}
      toggle={() => {
        setCloseModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCloseModelVisable(false);
        }}
      >
        Cancel
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to cancel this market?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCloseModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleClose();
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;
