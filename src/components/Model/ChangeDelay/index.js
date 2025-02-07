import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";

export const ChangeDelayModel = ({
  delayModelVisible,
  setDelayModelVisible,
  selectedDelay,
  setSelectedDelay,
  handleChange,
  singleCheck,
}) => {
  const [selectedDelayVals, setSelectedDelayVals] = useState({});
  useEffect(() => {
    setSelectedDelayVals(selectedDelay);
  }, []);

  return (
    <Modal
      isOpen={delayModelVisible}
      toggle={() => {
        setDelayModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">Change Delay</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedDelayVals?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedDelayVals?.eventRefId}</span>
              </div>
            </div>
            <Input
              type="number"
              id="delay"
              placeholder="Enter Delay"
              value={selectedDelay?.delay}
              style={{ width: "400px", marginLeft: "8px" }}
              onChange={(e) => {
                setSelectedDelay({
                  delay: +e.target.value,
                  commentaryId: selectedDelay?.commentaryId,
                });
              }}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setDelayModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange();
              }}
            >
              Change Delay
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
