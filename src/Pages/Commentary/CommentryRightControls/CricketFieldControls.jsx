import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
import CricketField from "../../../components/CricketField/CricketField";
import axiosInstance from "../../../Features/axios";
import Switch from "react-switch";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../../components/Common/Const";

const CricketFieldControls = ({ cricketFieldData, shotTypes, isShotType, handleShotTypeToggle, isOpen, toggle }) => {
  console.log("cricketFieldData", cricketFieldData)
  console.log("shotTypes", shotTypes)
  console.log("isShotType", isShotType)
  console.log("handleShotTypeToggle", handleShotTypeToggle)
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
    <div className="">
      <div className="d-flex align-items-center">
        <span className="mx-2 text-center">Ball : {cricketFieldData?.overCount}  {cricketFieldData?.bowler}  to {cricketFieldData?.batter}</span>
      </div>
      <div>
      <div className="d-flex align-items-center">
        <span>Tracking a selection shot type</span>
        <Switch
          width={70}
          uncheckedIcon={<OffsymbolStatus />}
          checkedIcon={<OnSymbolStatus />}
          className="pe-0 mx-2"
          onColor="#02a499"
          onChange={() => {
            handleShotTypeToggle(!isShotType)
          }}
          checked={isShotType}
        />
      </div>
        <div className="d-flex justify-content-center">
        {currentStep === 2 && isShotType ? (
          <div className="shot-types-container d-flex flex-wrap w-100">
            {shotTypes.map((shot) => (
              <Button
                key={shot.id}
                color={selectedShotType === shot.name ? "success" : "light"}
                className="m-2"
                style={{ width:"100px", height:"100px"}}
                onClick={() => handleShotType(shot)}
              >
                {/* <img
                  src={shot.image}
                  alt={shot.name}
                  style={{
                    height: "200px",
                    width: "200px",
                    objectFit: "cover", // Ensures the image fits within the given size
                    borderRadius: "10px", // Optional styling for rounded edges
                  }}
                /> */}
                <span>{shot.name}</span>
              </Button>
            ))}
          </div>
        ) : (
          <CricketField
            runs={cricketFieldData?.run}
            boundary={cricketFieldData?.isBoundary}
            line={line}
            setLine={setLine}
          />
        )}
        </div>
      </div>
      <div>
        {currentStep === 2 && (
          <Button
            color="secondary"
            onClick={() => setCurrentStep(1)} // Go back to Cricket Field step
          >
            Back
          </Button>
        )}
        {/* <Button
          color="primary"
          onClick={handleNextStep}
          disabled={currentStep === 2 && !selectedShotType} // Disable if no shot type selected
        >
          {currentStep === 1 ? "Next" : "Submit"}
        </Button> */}
          <Button color="light" className="decision-Button text-right" onClick={() => toggle()}>Close</Button>
      </div>
    </div>
  );
};

export default CricketFieldControls;