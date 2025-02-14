import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
const UndoOverControls = ({
  isOpen,
  toggle,
  onChangebowlerClick,
  onLastOverClick,
}) => {
  return (
    <div className="col-8 min-vh-40">
      <h5 className="control-title">Undo Over</h5>
      <div>Please select one</div>
      <div className="mt-4 gap-2">
        <div className="col-12" onClick={onChangebowlerClick}>
          <button className="score-control-confirm-ball-btns">
            Change Bowler
          </button>
        </div>
        <div className="col-12 mt-2" onClick={() => toggle()}>
          <button className="score-control-confirm-ball-btns">
            Close
          </button>
        </div>
        <div className="col-12 mt-2" onClick={onLastOverClick}>
          <button className="score-control-confirm-ball-btns">
            Last Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoOverControls;
