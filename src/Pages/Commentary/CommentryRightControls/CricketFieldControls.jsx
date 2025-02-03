import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
import CricketField from "../../../components/CricketField/CricketField";
import axiosInstance from "../../../Features/axios";
import Switch from "react-switch";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../../components/Common/Const";

const CricketFieldControls = ({
  cricketFieldData,
  shotTypes,
  isShotType,
  handleShotTypeToggle,
  isOpen,
  toggle,
}) => {
  const [line, setLine] = useState(null);
  const [selectedShotType, setSelectedShotType] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const dispatch = useDispatch();

  const OffsymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          // paddingRight: 2,
        }}
      >
        {" "}
        shotType
      </div>
    );
  };
  const OnSymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          // paddingRight: 4,
        }}
      >
        {" "}
        shotType
      </div>
    );
  };
  const handleWagonWheelCoords = async (
    endX,
    endY,
    remarkData,
    selectedShotType
  ) => {
    const payload = {
      commentaryBallByBallId: cricketFieldData?.commentaryBallByBallId,
      x2: endX,
      y2: endY,
      shortType: selectedShotType,
      commentryRemark: remarkData,
    };
    try {
      await axiosInstance.post(`/admin/commentary/wagonWheel`, payload);
      toggle();
    } catch (error) {
      console.error("Error updating wagon wheel coords:", error);
    }
  };

  useEffect(() => {
    if (line && isShotType) {
      setCurrentStep(2);
    } else if (line && !isShotType) {
      const passedPositionsText = line?.passedPositions?.length
        ? `${line.passedPositions.join(", ")}`
        : "";
      const remark = `${cricketFieldData?.bowler} to ${cricketFieldData?.batter}, ${line?.runs} runs, ${cricketFieldData?.batter} to ${passedPositionsText}`;
      handleWagonWheelCoords(line?.endX, line?.endY, remark, null);
    }
  }, [line]);

  const handleShotType = (shot) => {
    if (shot && line) {
      setSelectedShotType(shot.name);
      const passedPositionsText = line?.passedPositions?.length
        ? `${line.passedPositions.join(", ")}`
        : "";
      const remark = `${cricketFieldData?.bowler} to ${cricketFieldData?.batter}, ${line?.runs} runs, ${cricketFieldData?.batter} ${shot.name} to ${passedPositionsText}`;
      handleWagonWheelCoords(line?.endX, line?.endY, remark, shot?.name);
    }
  };

  return (
    // <div
    //   backdrop="static"
    //   className="commentary-modal green-success-modal"
    //   zIndex={1000}
    //   isOpen={isOpen}
    //   toggle={toggle}
    //   size="lg"
    // >
    <div className="col-12">
      <div className="col">
        <span>
          Ball : {cricketFieldData?.overCount} {cricketFieldData?.bowler} to{" "}
          {cricketFieldData?.batter}
        </span>
      </div>

      <div className="d-flex align-items-center">
        <span>Tracking a selection shot type</span>
        <Switch
          width={70}
          uncheckedIcon={<OffsymbolStatus />}
          checkedIcon={<OnSymbolStatus />}
          className="pe-0 mx-2"
          onColor="#02a499"
          onChange={() => {
            handleShotTypeToggle(!isShotType);
          }}
          checked={isShotType}
        />
      </div>
      <div className="col-12 d-flex">
      <div className="col-6">
          <CricketField
            runs={cricketFieldData?.run}
            boundary={cricketFieldData?.isBoundary}
            line={line}
            setLine={setLine}
          />
        </div>
        <div className="col-6 row row-cols-2">
          {isShotType && (
            <div className="col-12 d-flex flex-wrap">
              {shotTypes.map((shot) => (
                <div className="col-6" key={shot.id}>
                  <button
                    onClick={() => handleShotType(shot)}
                    className="score-wheel-btns m-2"
                  >
                    <span>{shot.name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* : (
            <CricketField
              runs={cricketFieldData?.run}
              boundary={cricketFieldData?.isBoundary}
              line={line}
              setLine={setLine}
            />
          ) */}
        </div>
        
      </div>
    </div>
  );
};

export default CricketFieldControls;
