import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";

export const ChangeMarketResultModel = ({
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
            <div className="my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedResultVals?.eventName}</span>
              </div>
              <div className="d-flex">
                <div style={{ marginRight: "20px" }}>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    Market Name:
                  </span>
                  <span>{selectedResultVals?.marketName}</span>
                </div>
                <div>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    RefId:
                  </span>
                  <span>{selectedResultVals?.eventRefId}</span>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div style={{ fontWeight: 600, marginRight: "8px" }}>
                Result :
              </div>
              <Input
                type="number"
                placeholder="Enter Result"
                value={+selectedResult?.result}
                style={{ width: "300px", marginLeft: "8px" }}
                onChange={(e) => {
                  setSelectedResult({
                    eventMarketId: selectedResult?.eventMarketId,
                    result: +e.target.value,
                  });
                }}
              />
            </div>
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
              className="btn btn-warning"
              onClick={() => {
                handleChange(false);
              }}
            >
              Set Market Result
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange(true);
              }}
            >
              Set Market Result & Approve
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
