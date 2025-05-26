import React, { useState, useEffect } from "react";
import { Input, Modal, ModalBody } from "reactstrap";
import ReactSelect from "react-select";

export const ChangeResultModel = ({
  resultModelVisible,
  setResultModelVisible,
  selectedResult,
  handleChange,
}) => {
  const [selectedResultVals, setSelectedResultVals] = useState({});
  const [teamList, setTeamList] = useState([]);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [winRmk, setWinRmk] = useState("");
  const [result, setResult] = useState("");
  console.log({selectedResult});
  useEffect(() => {
    if (selectedResult) {
      setSelectedResultVals(selectedResult);
      if (selectedResult?.winRmk) {
        setWinRmk(selectedResult.winRmk);
      }

      const teams = [{ label: "Select Winner", value: null }];
      if (selectedResult?.team1Name && selectedResult?.team1Id) {
        teams.push({
          label: selectedResult.team1Name,
          value: selectedResult.team1Id,
        });
      }
      if (selectedResult?.team2Name && selectedResult?.team2Id) {
        teams.push({
          label: selectedResult.team2Name,
          value: selectedResult.team2Id,
        });
      }

      // Set selected winner if winnerId exists
      if (selectedResult?.winnerId) {
        const winner = teams.find(
          (team) => team.value === selectedResult.winnerId
        );
        if (winner) {
          setSelectedWinner(winner);
        }
      } else {
        setSelectedWinner(teams[0]); // Default to "Select Winner"
      }
      if (teams.length > 1) setTeamList(teams);
    }
  }, []);

  useEffect(() => {
    if (selectedWinner && selectedWinner.value !== null) {
      setResult(`${selectedWinner?.label || ""} ${winRmk}`);
    }
  }, [selectedWinner, winRmk]);

  return (
    <Modal
      isOpen={resultModelVisible}
      toggle={() => {
        setResultModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">
              Change Result
            </h4>
            <div className="d-flex my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedResultVals?.eventName}</span>
              </div>
              <div>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  RefId:
                </span>
                <span>{selectedResultVals?.eventRefId}</span>
              </div>
            </div>

            {/* Winner Selection Dropdown */}
            <div className="mb-3">
              {/* <label className="form-label">Select Winner</label> */}
              <ReactSelect
                classNamePrefix="filter-dropdown"
                id="winner"
                name="winner"
                value={selectedWinner}
                options={teamList}
                onChange={(option) => setSelectedWinner(option)}
                placeholder="Select Winner"
                styles={{
                  container: (provided) => ({
                    ...provided,
                    width: "400px",
                    marginLeft: "8px",
                  }),
                }}
              />
            </div>

            <Input
              type="text"
              id="result"
              placeholder="Enter Result"
              value={winRmk}
              style={{ width: "400px", marginLeft: "8px" }}
              onChange={(e) => setWinRmk(e.target.value)}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setResultModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange({
                  commentaryId: selectedResult?.commentaryId,
                  result: result,
                  winRmk: winRmk,
                  winnerId: selectedWinner.value,
                  winnerName: selectedWinner.value ? selectedWinner.label : "",
                });
              }}
            >
              Change Result
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
