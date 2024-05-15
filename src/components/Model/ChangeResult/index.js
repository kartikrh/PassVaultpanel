import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";

export const ChangeResultModel = ({
  resultModelVisible,
  setResultModelVisible,
  selectedResult,
  setSelectedResult,
  handleChange,
  singleCheck,
}) => {
  const [selectedResultVals, setSelectedResultVals] = useState({});
  useEffect(() => {
    setSelectedResultVals(selectedResult);
  }, []);

  return (
    <Modal
      isOpen={resultModelVisible}
      toggle={() => {
        setResultModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg">Change Result</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedResultVals?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedResultVals?.eventRefId}</span>
              </div>
            </div>
            <Input
              type="text"
              id="result"
              placeholder="Enter Result"
              value={selectedResult?.result}
              style={{ width: "400px", marginLeft: "8px" }}
              onChange={(e) => {
                setSelectedResult({
                  result: e.target.value,
                  commentaryId: selectedResult?.commentaryId,
                });
              }}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setResultModelVisible(false);
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
              Change Result
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
