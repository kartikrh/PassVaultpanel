import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  deleteModelVisable,
  setDeleteModelVisable,
  selectedRowData,
  handleDelete,
  data,
}) => {
  const [modal_delete, setModal_delete] = useState(true);
  function tog_close() {
    setModal_delete(!modal_delete);
  }
  return (
    <Modal
      isOpen={deleteModelVisable}
      toggle={() => {
        setDeleteModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setDeleteModelVisable(false);
        }}
      >
        Delete
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to delete selected player {data} history?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setDeleteModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleDelete(selectedRowData);
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