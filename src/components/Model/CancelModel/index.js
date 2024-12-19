import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  cancelModelVisible,
  setCancelModelVisible,
  handleCancel,
  singleCheck,
}) => {
  const [modal_cancel, setModal_cancel] = useState(true);
  function tog_cancel() {
    setModal_cancel(!modal_cancel);
  }
  return (
    <Modal
      isOpen={cancelModelVisible}
      toggle={() => {
        setCancelModelVisible(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCancelModelVisible(false);
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
              Are you sure you want to cancel this commentary?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCancelModelVisible(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleCancel();
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
