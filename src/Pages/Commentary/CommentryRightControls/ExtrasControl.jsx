import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import { BALL_WIDE, EXTRAS, NO_BALL, WICKET } from "../CommentartConst";
import "../CommentaryCss.css";

const ExtrasControl = ({ toggle, isOpen, extraType, updateExtras }) => {
  const defaultValue = extraType === BALL_WIDE || extraType === NO_BALL ? 0 : 1;
  const [run, setRun] = useState(defaultValue);
  const [isBoundary, setIsBoundary] = useState(undefined);
  const handleSubmit = (type) => {
    const objToSend = {
      run: +run,
      type,
      isBoundary: +run === 4 || +run === 6 ? isBoundary : false,
    };
    updateExtras(objToSend);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) toggle();
    else if (e.key === "Enter") handleSubmit(EXTRAS);
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [run]);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById("runs");
        if (inputElement) inputElement.focus();
      }, 150);
    }
  }, [isOpen]);

  const extraTypehandleSubmit = (type) => {
      const objToSend = {
        run: +run,
        type,
        isBoundary: +run === 4 || +run === 6 ? isBoundary : false,
      };
      // console.log("objToSend", objToSend)
      updateExtras(objToSend);
    };
  return (
    <div className="col-6">
      <div className="col-6">
        <button className="score-control-ball-types-btns active">
          {extraType?.type || extraType}
        </button>
      </div>
      <div className="my-4 col-12">
        <>
          {
            <input
              className="runs-input"
              type="number"
              value={run}
              id={"runs"}
              onChange={(e) => setRun(e.target.value)}
              min={0}
              max={99}
              step={1}
            />
          }
          {(+run === 4 || +run === 6) && (
            <div>
              Is Boundary
              <div className="switch-padding form-switch form-switch-lg ">
                <input
                  className="runs-input"
                  type="checkbox"
                  id="customSwitchsizelg"
                  // defaultChecked
                  placeholder="Extra Runs"
                  checked={isBoundary}
                  onChange={(e) => {
                    setIsBoundary(!isBoundary);
                  }}
                  value={isBoundary}
                />
              </div>
            </div>
          )}
        </>
      </div>
      <div className="col mb-2 mt-5">
        <button
          onClick={() => extraTypehandleSubmit(WICKET)}
          className="score-control-wicket-ball-btns"
        >
          Wicket
        </button>
      </div>
      <div className="col d-flex justify-content-center gap-4">
        <div className="col-12" onClick={() => extraTypehandleSubmit(EXTRAS)}>
          <button className="score-control-confirm-ball-btns">Update</button>
        </div>
        {/* <div className="col-6" onClick={extrasTypeToggle}>
                                    <button className="score-control-conformation-close-btn">
                                      Close
                                    </button>
                                  </div> */}
      </div>
    </div>
  );
};

export default ExtrasControl;
