import React, { useEffect } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
const ChangeInningsControls = ({ isOpen, toggle, onYesClick, onNoClick }) => {
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
  return (
    <div className="col-8 d-flex flex-column m-0 p-0">
      <div>
        <div>Change Innings</div>
        <div>Do you want to end the current innings?</div>
      </div>
      <div className="d-flex gap-2 mt-auto">
        <div className="col-6" onClick={onYesClick}>
          <button className="score-control-confirm-ball-btns">Yes</button>
        </div>
        <div className="col-6" onClick={onNoClick}>
          <button className="score-control-conformation-close-btn">No</button>
        </div>
      </div>
    </div>
  );
};

export default ChangeInningsControls;
