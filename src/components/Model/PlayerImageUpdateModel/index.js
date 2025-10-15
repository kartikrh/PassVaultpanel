import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import Flatpickr from "react-flatpickr";

const Index = ({
  isPlayerImageUpdateModule,
  setIsPlayerImageUpdateModule,
  handleV2,
  handleV1,
}) => {
  return (
    <Modal
      isOpen={isPlayerImageUpdateModule}
      toggle={() => {
        setIsPlayerImageUpdateModule(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setIsPlayerImageUpdateModule(false);
        }}
      >
        Update jersey image for players
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody className="d-flex flex-column justify-content-start">
          <div
            className="d-flex flex-column justify-content-start align-items-center p-4"
            id="modal-id"
          >
            <div className="mt-2 mb-2 w-100 d-flex align-items-center">
              <span className="me-2">1.&nbsp;</span>
              <button
                className="btn btn-primary flex-grow-1 text-start"
                id="add-btn"
                onClick={handleV2}
              >
                Update player in which jersey is not generated
              </button>
            </div>

            <div className="mb-4 w-100 d-flex align-items-center">
              <span className="me-2">2.&nbsp;</span>
              <button
                className="btn btn-primary flex-grow-1 text-start"
                id="add-btn"
                onClick={handleV1}
              >
                Update jersey for all players
              </button>
            </div>

            {/* <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setIsPlayerImageUpdateModule(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleDelete();
                }}
              >
                Delete
              </button>
            </div> */}
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;
