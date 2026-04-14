import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  abandonModelVisible,
  setAbandonModelVisible,
  handleAbandon,
}) => {
  const [modal_abandon, setModal_abandon] = useState(true);
  function tog_abandon() {
    setModal_abandon(!modal_abandon);
  }
  return (
    <Modal
      isOpen={abandonModelVisible}
      toggle={() => {
        setAbandonModelVisible(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setAbandonModelVisible(false);
        }}
      >
        Abandon
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to abandon this commentary?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setAbandonModelVisible(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleAbandon();
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
