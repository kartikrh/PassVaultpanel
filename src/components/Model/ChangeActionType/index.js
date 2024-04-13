import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import ReactSelect from "react-select";

export const ChangeActionTypeModel = ({
  changeModelVisible,
  setChangeModelVisible,
  selectedClientSocket,
  setSelectedClientSocket,
  handleChange,
  singleCheck,
}) => {
  const [selectedClientSocketVals, setSelectedClientSocketVals] = useState({});
  useEffect(() => {
    setSelectedClientSocketVals(selectedClientSocket);
  }, []);
 
  const actionTypeOptions = [
    { label: "Connect", value: 1 },
    { label: "Disconnect", value: 2 },
  ];

  return (
    <Modal
      isOpen={changeModelVisible}
      toggle={() => {
        setChangeModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg">Change Action Type</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Server:
                </span>
                <span>{selectedClientSocketVals?.serverName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Url:
                </span>
                <span>{selectedClientSocketVals?.url}</span>
              </div>
            </div>
            <ReactSelect
              classNamePrefix="select2-selection"
              id="actionType"
              name="actionType"
              defaultValue={{
                label: selectedClientSocket?.actionType,
                value: selectedClientSocket?.eventRefId,
              }}
              options={actionTypeOptions}
              onChange={(e) => {
                setSelectedClientSocket({
                  actionType: e?.value,
                  clientSocketId: [selectedClientSocket?.clientSocketId],
                });
              }}
              required={true}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setChangeModelVisible(false);
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
              Change Action Type
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
