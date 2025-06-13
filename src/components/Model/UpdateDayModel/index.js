import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR } from "../../../components/Common/Const";
import ReactSelect from "react-select";

export const UpdateDayModel = ({
  updateDayModelVisible,
  setUpdateDayModelVisible,
  selectedCommentaryDay,
  setSelectedCommentaryDay,
  handleUpdateDay,
}) => {
  const [selectedCommentaryVals, setSelectedCommentaryVals] = useState({});
  const [dayData, setDayData] = useState({ pitchAge: "", session: "" });
  const dispatch = useDispatch();

  const pitchAgeOptions = [
    { label: "Select Pitch Age", value: "0" },
    { label: "Day 1", value: "1" },
    { label: "Day 2", value: "2" },
    { label: "Day 3", value: "3" },
    { label: "Day 4", value: "4" },
    { label: "Day 5", value: "5" },
  ];

  useEffect(() => {
    setSelectedCommentaryVals(selectedCommentaryDay);
    fetchDayData();
  }, [selectedCommentaryDay]);

  const fetchDayData = async () => {
    await axiosInstance
      .post(`/admin/commentary/pitchAndSession`, {
        commentaryId: selectedCommentaryDay?.commentaryId,
      })
      .then((response) => {
        const apiData = response?.result;
        setDayData({
          pitchAge: apiData?.pitchAge || "",
          session: apiData?.session || "",
        });
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleUpdate = () => {
    const updatedData = {
      commentaryId: selectedCommentaryDay?.commentaryId,
      pitchAge: dayData.pitchAge,
      session: dayData.session,
    };
    handleUpdateDay(updatedData); // Pass the data as parameter
  };

  return (
    <Modal
      isOpen={updateDayModelVisible}
      toggle={() => {
        setUpdateDayModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">
              Update Day
            </h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedCommentaryVals?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedCommentaryVals?.eventRefId}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Pitch Age</label>
              <ReactSelect
                classNamePrefix="filter-dropdown"
                id="pitchAge"
                name="pitchAge"
                value={
                  pitchAgeOptions.find(
                    (opt) => opt.value === String(dayData.pitchAge)
                  ) || pitchAgeOptions[0] // Default to "Select Pitch Age"
                }
                options={pitchAgeOptions}
                onChange={(option) =>
                  setDayData({ ...dayData, pitchAge: option.value })
                }
                placeholder="Select Pitch Age"
                styles={{
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Session</label>
              <input
                type="text"
                className="form-control"
                value={dayData.session}
                onChange={(e) =>
                  setDayData({ ...dayData, session: e.target.value })
                }
                placeholder="Enter session"
              />
            </div>
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setUpdateDayModelVisible(false);
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
              Update
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
