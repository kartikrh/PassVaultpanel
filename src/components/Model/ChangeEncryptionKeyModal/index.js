import React, { useState, useEffect } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Alert,
} from "reactstrap";

// Two steps: (1) enter the new key value, (2) confirm with the
// LOADDATAPASSWORD password -- same gate the Config reveal-eye and
// "reload data" actions use. `onSubmit(newKey, password)` should call the
// rotation endpoint and either resolve (success message shown here) or
// throw with a user-facing message.
const STEP_ENTER_KEY = 1;
const STEP_CONFIRM_PASSWORD = 2;
const STEP_DONE = 3;

const ChangeEncryptionKeyModal = ({ visible, setVisible, onSubmit }) => {
  const [step, setStep] = useState(STEP_ENTER_KEY);
  const [newKey, setNewKey] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setStep(STEP_ENTER_KEY);
      setNewKey("");
      setPassword("");
      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleContinue = () => {
    setErrorMessage("");
    if (!newKey.trim()) {
      setErrorMessage("Enter the new encryption key value");
      return;
    }
    setStep(STEP_CONFIRM_PASSWORD);
  };

  const handleRotate = async () => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const message = await onSubmit(newKey, password);
      setSuccessMessage(message || "Encryption key rotated successfully.");
      setStep(STEP_DONE);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to rotate encryption key");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deliberately doesn't auto-close on backdrop/Escape once rotation has
  // succeeded -- the restart reminder needs to actually be read, not
  // dismissed by accident.
  const toggle = () => {
    if (step !== STEP_DONE) setVisible(false);
  };

  return (
    <Modal isOpen={visible} toggle={toggle} centered>
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        Change Encryption Key
      </ModalHeader>
      <ModalBody>
        {step === STEP_ENTER_KEY && (
          <>
            <Alert color="warning">
              This re-encrypts staff passwords, TOTP secrets, White Label
              secrets, Mail Settings passwords, and vault client Drive
              tokens with the new key, in one transaction. Nothing changes
              until you confirm with the password on the next step.
            </Alert>
            <Label for="new-encryption-key">New Encryption Key</Label>
            <Input
              id="new-encryption-key"
              type="text"
              placeholder="Enter the new key value"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              autoFocus
            />
            {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
            <div className="hstack gap-2 justify-content-center mt-4">
              <button type="button" className="btn btn-light" onClick={() => setVisible(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === STEP_CONFIRM_PASSWORD && (
          <>
            <div className="d-flex align-items-center">
              <Label for="rotate-key-password">Enter Password</Label>
              <Input
                type="password"
                id="rotate-key-password"
                placeholder="Enter your password"
                value={password}
                style={{ width: "300px", marginLeft: "8px" }}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRotate()}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
            <div className="hstack gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setStep(STEP_ENTER_KEY)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button className="btn btn-danger" onClick={handleRotate} disabled={isSubmitting}>
                {isSubmitting ? "Rotating..." : "Rotate Key"}
              </button>
            </div>
          </>
        )}

        {step === STEP_DONE && (
          <>
            <Alert color="success" className="mb-3">
              {successMessage}
            </Alert>
            <Alert color="warning" className="mb-0">
              <strong>Restart PassVaultapi now.</strong> Logins and other
              encrypted lookups made against a process that hasn't restarted
              yet may not reflect the full change.
            </Alert>
            <div className="hstack gap-2 justify-content-center mt-4">
              <button className="btn btn-primary" onClick={() => setVisible(false)}>
                Close
              </button>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ChangeEncryptionKeyModal;
