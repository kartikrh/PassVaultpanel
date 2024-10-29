import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { convertDateLocalToUTC } from "../../Common/Reusables/reusableMethods";

const Index = ({
  closeSuspendTimeModelVisible,
  setCloseSuspendTimeModelVisible,
  handleCloseSuspendTime,
  closeSuspendTimeRecord,
  setCloseSuspendTimeRecord,
}) => {
  const [selectedCloseSuspendTime, setSelectedCloseSuspendTime] = useState({});

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    setSelectedCloseSuspendTime(closeSuspendTimeRecord);
  }, []);
  return (
    <Modal
      isOpen={closeSuspendTimeModelVisible}
      toggle={() => {
        setCloseSuspendTimeModelVisible(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCloseSuspendTimeModelVisible(false);
        }}
      >
        Close Suspend Time
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column justify-content-center"
            id="modal-id"
          >
            <div className="d-flex my-2">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event:
                </span>
                <span>{selectedCloseSuspendTime?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Market:
                </span>
                <span>{selectedCloseSuspendTime?.marketName}</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 my-2">
              <span className="tournament-team-name">After Close Time:</span>
              <input
                className="form-control multi-dropdown-width"
                type="datetime-local"
                defaultValue={
                  closeSuspendTimeRecord?.afterCloseTime
                    ? formatDateForInput(closeSuspendTimeRecord?.afterCloseTime)
                    : null
                }
                onChange={(startDate) => {
                  setCloseSuspendTimeRecord({
                    eventMarketId: closeSuspendTimeRecord?.eventMarketId,
                    afterSuspendTime: closeSuspendTimeRecord?.afterSuspendTime,
                    afterCloseTime: convertDateLocalToUTC(
                      startDate?.target?.value
                    ),
                  });
                }}
                id="example-datetime-local-input"
              />
            </div>
            <div className="d-flex align-items-center gap-2 my-2">
              <span className="tournament-team-name">After Suspend Time:</span>
              <input
                className="form-control multi-dropdown-width"
                type="datetime-local"
                defaultValue={
                  closeSuspendTimeRecord?.afterSuspendTime
                    ? formatDateForInput(
                        closeSuspendTimeRecord?.afterSuspendTime
                      )
                    : null
                }
                onChange={(startDate) => {
                  setCloseSuspendTimeRecord({
                    eventMarketId: closeSuspendTimeRecord?.eventMarketId,
                    afterCloseTime: closeSuspendTimeRecord?.afterCloseTime,
                    afterSuspendTime: convertDateLocalToUTC(
                      startDate?.target?.value
                    ),
                  });
                }}
                id="example-datetime-local-input"
              />
            </div>
            <div className="hstack gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCloseSuspendTimeModelVisible(false);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="add-btn"
                onClick={() => {
                  handleCloseSuspendTime();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default Index;
