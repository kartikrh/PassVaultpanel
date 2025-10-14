import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  deleteAllModelVisable,
  setDeleteAllModelVisable,
  handleDeleteAll,
  singleCheck,
}) => {
  const domain = window.location.hostname
  const [modal_delete, setmodal_delete] = useState(true);
  function tog_deleteAll() {
    setmodal_delete(!modal_delete);
  }
  console.log("domain", domain)
  return (
    <Modal
      isOpen={deleteAllModelVisable}
      toggle={() => {
        setDeleteAllModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setDeleteAllModelVisable(false);
        }}
      >
        Delete All Commentary
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to delete all commentary ?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setDeleteAllModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleDeleteAll();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;
