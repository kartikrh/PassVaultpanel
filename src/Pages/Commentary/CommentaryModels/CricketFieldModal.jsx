import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../CommentaryCss.css";
import CricketField from "../../../components/CricketField/CricketField";
import axiosInstance from "../../../Features/axios";
import Switch from "react-switch";

const CricketFieldModal = ({ cricketFieldData, shotTypes, isOpen, toggle }) => {
  const [line, setLine] = useState(null);
  const [isShotType, setIsShotType] = useState(true);
  const [selectedShotType, setSelectedShotType] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

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
      const remark = `${cricketFieldData?.bowler} to ${cricketFieldData?.batter} hit towards ${line?.position} with ${line?.runs} runs`;
      handleWagonWheelCoords(line?.endX, line?.endY, remark, null);
    }
  }, [line]);

  const handleShotType = (shot) => {
    if (shot && line) {
      setSelectedShotType(shot.name);
      const remark = `${cricketFieldData?.bowler} to ${cricketFieldData?.batter} hit towards ${shot.name} ${line?.position} with ${line?.runs} runs`;
      handleWagonWheelCoords(line?.endX, line?.endY, remark, shot?.name);
    }
  };
  return (
    <Modal
      backdrop="static"
      className="commentary-modal green-success-modal"
      zIndex={1000}
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
    >
      <ModalHeader toggle={toggle} className="d-flex align-items-center">
        <Switch
          width={70}
          uncheckedIcon={<OffsymbolStatus />}
          checkedIcon={<OnSymbolStatus />}
          className="pe-0"
          onColor="#02a499"
          onChange={() => {
            setIsShotType(!isShotType);
          }}
          checked={isShotType}
        />
        <span className="mx-2 text-center">Cricket Field</span>
      </ModalHeader>
      <ModalBody className="d-flex justify-content-center">
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
      </ModalBody>
      <ModalFooter>
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
      </ModalFooter>
    </Modal>
  );
};

export default CricketFieldModal;