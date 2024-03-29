import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  suspendModelVisible,
  setSuspendModelVisable,
  handleSuspend,
  singleCheck,
}) => {
  const [modal_suspend, setModal_suspend] = useState(true);
  function tog_suspend() {
    setModal_suspend(!modal_suspend);
  }
  return (
    <Modal
      isOpen={suspendModelVisible}
      toggle={() => {
        setSuspendModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setSuspendModelVisable(false);
        }}
      >
        Suspend
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to suspend this commentary?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setSuspendModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleSuspend();
                }}
              >
                Suspend
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;
