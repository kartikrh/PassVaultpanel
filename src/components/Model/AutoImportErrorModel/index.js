import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { convertDateUTCToLocal2_24, convertDateUtcFormat24 } from "../../Common/Reusables/reusableMethods";

export const AutoImportErrorModel = ({ isOpen, toggle, recordData, recordRefType }) => {
  const dateTyp = JSON.parse(localStorage.getItem("DateType"));

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Error
        {recordData && (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '50px' }}>
            {/* Left part */}
            <div>
              <div>Ref ID:<strong> {recordData.refId}</strong></div>
              <div>Type:<strong> {recordRefType}</strong></div>
            </div>

            {/* Right part */}
            <div>
              <div>Date:<strong> {dateTyp?.value == 1
                ? convertDateUTCToLocal2_24(recordData?.createdDate, "index")
                : convertDateUtcFormat24(recordData?.createdDate, "index")
              }</strong></div>
            </div>
          </div>
        )}
      </ModalHeader>
      <ModalBody>
        <pre style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          maxHeight: "400px",
          overflowY: "auto"
        }}>
          {recordData?.errorStackData}
        </pre>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={toggle}>
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
};
