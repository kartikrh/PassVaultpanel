import React, { useState, useEffect } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

// Password-gated reveal for a Config row's value -- same LOADDATAPASSWORD
// check the "reload data" action uses. `onSubmitPassword` is expected to
// return the real value (string) or throw with a user-facing message.
//
// Two modes:
// - default: shows the revealed value read-only inside this modal (list view).
// - `onRevealed` passed: closes the modal and hands the value to the caller
//   instead (edit view, where the value needs to populate an editable form).
const RevealConfigValueModal = ({
  visible,
  setVisible,
  configKey,
  onSubmitPassword,
  onRevealed,
}) => {
  const [password, setPassword] = useState("");
  const [revealedValue, setRevealedValue] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setRevealedValue(null);
      setErrorMessage("");
    }
  }, [visible]);

  const handleReveal = async () => {
    setErrorMessage("");
    try {
      const value = await onSubmitPassword(password);
      if (onRevealed) {
        onRevealed(value ?? "");
        setVisible(false);
      } else {
        setRevealedValue(value ?? "");
      }
    } catch (err) {
      setErrorMessage(err?.message || "Invalid password");
    }
  };

  return (
    <Modal isOpen={visible} toggle={() => setVisible(false)} centered>
      <ModalHeader
        className="bg-light p-3"
        toggle={() => setVisible(false)}
      >
        {revealedValue !== null ? `Value of "${configKey}"` : `Show value of "${configKey}"`}
      </ModalHeader>
      <ModalBody>
        {revealedValue === null ? (
          <>
            <div className="d-flex align-items-center">
              <Label for="reveal-config-password">Enter Password</Label>
              <Input
                type="password"
                id="reveal-config-password"
                placeholder="Enter your password"
                value={password}
                style={{ width: "300px", marginLeft: "8px" }}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReveal()}
              />
            </div>
            {errorMessage && (
              <div className="text-danger mt-2">{errorMessage}</div>
            )}
            <div className="hstack gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setVisible(false)}
              >
                Close
              </button>
              <button className="btn btn-success" onClick={handleReveal}>
                Ok
              </button>
            </div>
          </>
        ) : (
          <>
            <Input
              type="textarea"
              readOnly
              value={revealedValue}
              className="mt-2"
            />
            <div className="hstack gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setVisible(false)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default RevealConfigValueModal;
