import React, { useState } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

const PredictMarketPasswordModal = ({
  predictMarketPasswordModalVisable,
  setPredictMarketPasswordModalVisable,
  handleLoadData,
  moduleName,
}) => {
  const [password, setPassword] = useState("");

  return (
    <Modal
      isOpen={predictMarketPasswordModalVisable}
      toggle={() => {
        setPredictMarketPasswordModalVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setPredictMarketPasswordModalVisable(false);
        }}
      >
        Predict market password
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex align-items-center">
            <Label for="pass">Enter Password</Label>
            <Input
              type="password"
              id="pass"
              placeholder="Enter your password"
              value={password}
              style={{ width: "300px", marginLeft: "8px" }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column align-items-center" id="modal-id">
            <span className="mt-4 mb-4">
              Are you sure you want to turn off the predict?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setPredictMarketPasswordModalVisable(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleLoadData(password);
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

export default PredictMarketPasswordModal;
