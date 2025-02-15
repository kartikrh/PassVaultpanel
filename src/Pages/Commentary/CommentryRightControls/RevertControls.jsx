import React, { useEffect } from "react";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";

const RevertControls = ({ isOpen, toggle, onYesClick, onNoClick, password, setPassword }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) onNoClick();
    else if (e.key === "Enter") onYesClick();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="col-8 d-flex flex-column m-0 p-0">
      <div>
        <div>Revert to Toss</div>
        <div className="my-2">
          Are you sure you want to revert the toss? This action will remove all
          related data.

          <FormGroup className="d-flex align-items-center gap-2 my-2">
            <Label className="margin-right-10 label-width" for="password">Enter Password</Label>
              <Input
                  className="form-control date-width"
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
              />
          </FormGroup>
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <div
          className="col-6"
          onClick={onYesClick}
        >
          <button className="score-control-confirm-ball-btns">Yes</button>
        </div>
        <div className="col-6" onClick={onNoClick}>
          <button className="score-control-conformation-close-btn">No</button>
        </div>
      </div>
    </div>
  );
};

export default RevertControls;
