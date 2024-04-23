import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";

export const ChangeEventRefIdModel = ({
  eventRefModelVisible,
  setEventRefModelVisible,
  selectedEventRef,
  setSelectedEventRef,
  handleChange,
  singleCheck,
}) => {
  const [selectedEventRefVals, setSelectedEventRefVals] = useState({});
  useEffect(() => {
    setSelectedEventRefVals(selectedEventRef);
  }, []);

  return (
    <Modal
      isOpen={eventRefModelVisible}
      toggle={() => {
        setEventRefModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg">Change Event Ref Id</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedEventRefVals?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedEventRefVals?.eventRefId}</span>
              </div>
            </div>
            <Input
              type="text"
              id="eventRefId"
              placeholder="Enter Event Ref Id"
              value={selectedEventRef?.eventRefId}
              style={{ width: "400px", marginLeft: "8px" }}
              onChange={(e) => {
                setSelectedEventRef({
                  eventRefId: e.target.value,
                  commentaryId: selectedEventRef?.commentaryId,
                });
              }}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setEventRefModelVisible(false);
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
              Change Event Ref Id
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
