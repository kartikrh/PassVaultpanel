import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import Select from "react-select";

export const ChangeScoringModel = ({
  scoringModelVisible,
  setScoringModelVisible,
  selectedCompititon,
  setSelectedCompititon,
  handleChange,
  singleCheck,
  setSelectedTableElements,
  selectedTableElements
}) => {

    useEffect(() => {
      if (selectedCompititon) {
          setSelectedTableElements({
          scoringType: selectedCompititon.scoringType
              ? {
                  value: selectedCompititon.scoringType,
                  label: selectedCompititon.scoringType == 1 ? "Manual" : selectedCompititon.scoringType == 2 ? "Entity" : "",
              }
              : null,
          tpId: selectedCompititon?.tpId ? selectedCompititon.tpId
              : null,
          });

      }
    }, [selectedCompititon]);

  return (
    <Modal
      isOpen={scoringModelVisible}
      toggle={() => {
        setScoringModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">Change Scoring Type</h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedCompititon?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedCompititon?.eventRefId}</span>
              </div>
            </div>
            <div style={{ flex: '1 1 50%' }}>
                <label className="form-label">Scoring Type:</label>
                <Select
                    styles={{ control: (base) => ({ ...base }) }}
                    value={selectedTableElements?.scoringType ? selectedTableElements?.scoringType : selectedCompititon.scoringType}
                    placeholder="Scoring Type"
                    onChange={(e) => {
                      setSelectedTableElements((prev) => ({
                        ...prev,
                          scoringType: e,
                      }));
                    // setEventTypeId(e?.value);
                    }}
                    options={[
                        { label: "Select Score Type", value: "0" },
                        { label: "Manual", value: 1 },
                        { label: "Entity", value: 2 },
                    ]}
                    classNamePrefix="filter-dropdown"
                />
            </div>
            {/* TpId */}
            {(selectedTableElements?.scoringType?.value ? selectedTableElements?.scoringType?.value : selectedCompititon.scoringType) === 2 &&
            <div style={{ flex: '1 1 50%' }}>
                <label className="form-label">TpId:</label>
                <Input
                  className="form-control"
                  placeholder="TpId"
                  type="text"
                  name="tpId"
                  value={
                    selectedTableElements?.tpId !== undefined
                      ? selectedTableElements.tpId
                      : selectedCompititon?.tpId || ""
                  }
                  onChange={(e) => {
                    setSelectedTableElements((prev) => ({
                      ...prev,
                      tpId: e.target.value,
                    }));
                  }}
                />
            </div>}
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setScoringModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange();
              }}
            >
              Change Scoring
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
