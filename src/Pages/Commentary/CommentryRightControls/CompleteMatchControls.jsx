import React, { useEffect } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
const CompleteMatchControls = ({ isOpen, toggle, onYesClick, onNoClick }) => {
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
        <div>Complete Match</div>
        <div>Do you want to complete this match?</div>
      </div>
      <div className="d-flex gap-2 mt-4">
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

export default CompleteMatchControls;
