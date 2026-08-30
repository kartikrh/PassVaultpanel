import React, { useState, useEffect } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

const TestMailModal = ({
  testMailModelVisable,
  setTestMailModelVisable,
  handleSendTestMail,
  record,
  isSending,
}) => {
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (testMailModelVisable) setTestEmail("");
  }, [testMailModelVisable]);

  return (
    <Modal
      isOpen={testMailModelVisable}
      toggle={() => setTestMailModelVisable(false)}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="testMailModalLabel"
        toggle={() => setTestMailModelVisable(false)}
      >
        Send Test Mail
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div className="mb-3">
            Sending using <strong>{record?.email}</strong> configuration.
          </div>
          <div className="d-flex align-items-center">
            <Label for="testEmail">Send To</Label>
            <Input
              type="email"
              id="testEmail"
              placeholder="Enter recipient email address"
              value={testEmail}
              style={{ width: "300px", marginLeft: "8px" }}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column align-items-center" id="modal-id">
            <div className="hstack gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setTestMailModelVisable(false)}
              >
                Close
              </button>
              <button
                className="btn btn-success"
                id="send-test-mail-btn"
                disabled={!testEmail || isSending}
                onClick={() => handleSendTestMail(testEmail)}
              >
                Send
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default TestMailModal;
