import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
const UndoInnnigsControls = ({
  isOpen,
  toggle,
  onPlayerSelectionClick,
  onLastInnigsClick,
}) => {
  return (
    <div className="col-8 min-vh-40">
      <h5 className="control-title">Change Innings</h5>
      <div>What do you want to perform?</div>
      {/* <div>
                <Button color="success" className="decision-Button" onClick={onPlayerSelectionClick}>Player Selection</Button>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
            </div> */}
      <div className="mt-4 d-flex col-12 gap-2">
        <div className="col-6" onClick={onPlayerSelectionClick}>
          <button className="score-control-confirm-ball-btns">
            Player Selection
          </button>
        </div>
        <div className="col-6" onClick={() => toggle()}>
          <button className="score-control-confirm-ball-btns">Close</button>
        </div>
      </div>
    </div>
  );
};

export default UndoInnnigsControls;
