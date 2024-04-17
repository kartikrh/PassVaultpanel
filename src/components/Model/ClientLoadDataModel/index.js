import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  loadClientModelVisable,
  setLoadClientModelVisable,
  handleLoadClientData,
  singleCheck,
}) => {
  const [modal_load_data, setmodal_load_data] = useState(true);
  function tog_load_data() {
    setmodal_load_data(!modal_load_data);
  }
  return (
    <Modal
      isOpen={loadClientModelVisable}
      toggle={() => {
        setLoadClientModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setLoadClientModelVisable(false);
        }}
      >
        Load Client Data
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="modal-id"
          >
            <span className="mt-4 mb-4">
              Are you sure you want to load client data ?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setLoadClientModelVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-warning"
                id="add-btn"
                onClick={() => {
                  handleLoadClientData();
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
