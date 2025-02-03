import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
const RunsControls = ({ toggle, onSubmitClick }) => {
  const [runs, setRuns] = useState(0);
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) toggle();
    else if (e.key === "Enter") onSubmitClick();
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  return (
    // <div backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
    <div className="col-12 min-vh-40">
      <div toggle={toggle}> Runs</div>
      <div>
        Please Enter Runs:
        <input
          className="runs-input"
          type="number"
          value={runs}
          id={"runs"}
          onChange={(e) => setRuns(e.target.value)}
          min={0}
          max={99}
          step={1}
        />
      </div>
      <div className="col d-flex justify-content-center gap-4 my-4">
        <div className="col-12" onClick={() => {onSubmitClick(+runs); toggle()}}>
          <button className="score-control-confirm-ball-btns">Submit</button>
        </div>
        {/* <div className="col-6" onClick={toggle}>
          <button className="score-control-conformation-close-btn">
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default RunsControls;
