import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const DeletePlayerModal = ({
  isDeletePlayer,
  setIsDeletePlayer,
  handleDeletePlayer,
  playerName
}) => {
  return (
    <Modal
      isOpen={isDeletePlayer}
      toggle={() => {
        setIsDeletePlayer(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setIsDeletePlayer(false);
        }}
      >
        Delete Player
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to Delete the {playerName.playerName}?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setIsDeletePlayer(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleDeletePlayer(playerName.playerId);
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

export default DeletePlayerModal;
