import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import ReactSelect from "react-select";
import { ERROR } from "../../Common/Const";

export const ChangeRunnerModel = ({
  runnerModelVisible,
  setRunnerModelVisible,
  selectedCommentaryRunner,
  setSelectedCommentaryRunner,
  handleChange,
  singleCheck,
}) => {
  const [runnerTypeList, setRunnerTypeList] = useState([]);
  const [selectedCommentaryVals, setSelectedCommentaryVals] = useState({});
  const [team1, setTeam1] = useState({});
  const [team2, setTeam2] = useState({});
  const [isTeam1Selected, setIsTeam1Selected] = useState(true);
  const [isTeam2Selected, setIsTeam2Selected] = useState(true);
  const [isTeamsData, setIsTeamsData] = useState(false);
  const [isMatchOdds, setIsMatchOdds] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedCommentaryVals(selectedCommentaryRunner);
  }, []);

  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/ImportMarket/getlistManualMarket`, {
        refID: selectedCommentaryRunner?.eventRefId,
      })
      .then((response) => {
        const runnerData = response?.result;
        if (runnerData?.teamsDetails) {
          setIsTeamsData(true);
          setTeam1({
            teamId: runnerData?.teamsDetails?.team1Id,
            teamName: runnerData?.teamsDetails?.team1Name,
          });
          setTeam2({
            teamId: runnerData?.teamsDetails?.team2Id,
            teamName: runnerData?.teamsDetails?.team2Name,
          });
        }
        let runnerDataIdList = [];
        const matchOdds = runnerData?.data?.filter(
          (item) => String(item.marketName).toLowerCase() == "match odds" || String(item.marketName).toLowerCase() == "bookmaker"
        );
        
        if (matchOdds?.length > 0) {
          setIsMatchOdds(true);
          matchOdds?.forEach((ele) => {
            runnerDataIdList.push({
              label: `${ele?.runner} - ${ele?.selectionId}`,
              value: ele?.selectionId,
            });
          });
        }
        setRunnerTypeList(runnerDataIdList);
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = () => {
    const team1Selected = selectedCommentaryRunner?.team1?.selectionId;
    const team2Selected = selectedCommentaryRunner?.team2?.selectionId;

    if (!team1Selected) {
      setIsTeam1Selected(false);
    }
    if (!team2Selected) {
      setIsTeam2Selected(false);
    }

    if (team1Selected && team2Selected) {
      handleChange();
    }
  };

  return (
    <Modal
      isOpen={runnerModelVisible}
      toggle={() => {
        setRunnerModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg">Set Runner Values</h4>
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
            {(isTeamsData && isMatchOdds) ? (
              <>
                <h6 className="text-left mt-2">{team1?.teamName}</h6>
                <ReactSelect
                  classNamePrefix="select2-selection"
                  id="runnerType1"
                  name="runnerType1"
                  placeholder="Select Runner"
                  defaultValue={{
                    label: "Select Runner Value",
                    value: 0,
                  }}
                  options={runnerTypeList}
                  onChange={(e) => {
                    setSelectedCommentaryRunner((prev) => ({
                      ...prev,
                      team1: {
                        selectionId: (e?.value).toString(),
                        teamId: team1?.teamId,
                      },
                    }));
                    setIsTeam1Selected(true);
                  }}
                  required={true}
                />
                {!isTeam1Selected && (
                  <div className="text-danger mt-1">
                    Please select a runner for {team1?.teamName}
                  </div>
                )}

                <h6 className="text-left mt-2">{team2?.teamName}</h6>
                <ReactSelect
                  classNamePrefix="select2-selection"
                  id="runnerType2"
                  name="runnerType2"
                  placeholder="Select Runner"
                  defaultValue={{
                    label: "Select Runner Value",
                    value: 0,
                  }}
                  options={runnerTypeList}
                  onChange={(e) => {
                    setSelectedCommentaryRunner((prev) => ({
                      ...prev,
                      team2: {
                        selectionId: (e?.value).toString(),
                        teamId: team2?.teamId,
                      },
                    }));
                    setIsTeam2Selected(true);
                  }}
                  required={true}
                />
                {!isTeam2Selected && (
                  <div className="text-danger mt-1">
                    Please select a runner for {team2?.teamName}
                  </div>
                )}
              </>
            ) : !isMatchOdds && isTeamsData ? (
              <h6 className="text-center mt-2">
                Data not available
              </h6>
            ) : !isTeamsData && isMatchOdds ? (
              <h6 className="text-center mt-2">Team data not available</h6>
            ) : !isTeamsData && !isMatchOdds ? (
              <h6 className="text-center mt-2">
                Team & Match Odds data not available
              </h6>
            ) : null }
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setRunnerModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
