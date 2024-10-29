import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { convertDateLocalToUTC, convertDateUTCToLocal } from "../../Common/Reusables/reusableMethods";

const Index = ({
  closeSuspendTimeModelVisible,
  setCloseSuspendTimeModelVisible,
  handleCloseSuspendTime,
  closeSuspendTimeRecord,
  setCloseSuspendTimeRecord,
}) => {
  const [selectedCloseSuspendTime, setSelectedCloseSuspendTime] = useState({});

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
              <div className="margin-right-20">
                <span className="margin-right-10">
                  Event :
                </span>
                <span className="font-bold">{selectedCloseSuspendTime?.eventName}</span>
              </div>
              <div>
                <span className="margin-right-10">
                  Market :
                </span>
                <span className="font-bold">{selectedCloseSuspendTime?.marketName}</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 my-2">
              <span className="margin-right-10 label-width">After Close Time</span>
              <input
                className="form-control date-width"
                type="datetime-local"
                defaultValue={
                  closeSuspendTimeRecord?.afterCloseTime
                    ? convertDateUTCToLocal(closeSuspendTimeRecord?.afterCloseTime)
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
              <span className="margin-right-10 label-width">After Suspend Time</span>
              <input
                className="form-control date-width"
                type="datetime-local"
                defaultValue={
                  closeSuspendTimeRecord?.afterSuspendTime
                    ? convertDateUTCToLocal(
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
