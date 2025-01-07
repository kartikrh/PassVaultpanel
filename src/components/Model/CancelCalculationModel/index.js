import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  cancelCalculateModelVisable,
  setCancelCalculateModelVisable,
  handleNoCalculate,
  singleCheck,
}) => {
  return (
    <Modal
      isOpen={cancelCalculateModelVisable}
      toggle={() => {
        setCancelCalculateModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCancelCalculateModelVisable(false);
        }}
      >
        Not calculate
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to not calculate the selected events?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCancelCalculateModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleNoCalculate();
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