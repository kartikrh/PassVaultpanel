import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import ReactSelect from "react-select";

export const ChangeStatusModel = ({
  changeStatusModelVisible,
  setChangeStatusModelVisible,
  selectedCompetitionRecord,
  setSelectedCompetitionRecord,
  handleChangeStatus,
}) => {
  const [selectedCompetitionVals, setSelectedCompetitionVals] = useState({});
  const [statusData, setStatusData] = useState({ commStatus: "" });

  const statusOptions = [
    { label: "Select Status", value: "0" },
    { label: "Upcoming", value: "1" },
    { label: "Started", value: "2" },
    { label: "Completed", value: "3" },
    { label: "Stop", value: "4" },
  ];

  useEffect(() => {
    setSelectedCompetitionVals(selectedCompetitionRecord);
    setStatusData({
      commStatus: selectedCompetitionRecord?.commStatus || "0",
    });
  }, [selectedCompetitionRecord]);

  const handleUpdate = () => {
    const updatedData = {
      competitionId: selectedCompetitionRecord?.competitionId,
      commStatus: statusData.commStatus,
    };
    handleChangeStatus(updatedData);
  };

  return (
    <Modal
      isOpen={changeStatusModelVisible}
      toggle={() => {
        setChangeStatusModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">
              Change Status
            </h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Competition:
                </span>
                <span>{selectedCompetitionVals?.competition}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedCompetitionVals?.refId}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Status: </label>
              <ReactSelect
                classNamePrefix="filter-dropdown"
                id="commStatus"
                name="commStatus"
                value={
                  statusOptions.find(
                    (opt) => opt.value === String(statusData.commStatus)
                  ) || statusOptions[0]
                }
                options={statusOptions}
                onChange={(option) =>
                  setStatusData({ ...statusData, commStatus: option.value })
                }
                placeholder="Select Status"
                // styles={{
                //   container: (provided) => ({
                //     ...provided,
                //     width: "100%",
                //   }),
                // }}
              />
            </div>
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setChangeStatusModelVisible(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleUpdate();
              }}
            >
              Change Status
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};