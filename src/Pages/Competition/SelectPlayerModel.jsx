import React, { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import { useDispatch } from "react-redux";
import ReactSelect from "react-select";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR } from "../../components/Common/Const";

export const SelectPlayersModel = ({
  playersModelVisible,
  setPlayersModelVisible,
  selectedTournament,
  setSelectedTournament,
  handleSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [playerList, setPlayerList] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTournamentVals, setSelectedTournamentVals] = useState({});
  const [originalTournamentPlayers, setOriginalTournamentPlayers] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    setSelectedTournamentVals(selectedTournament);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `/admin/tournamentTeamPlayers/playersList`,
        {
          teamId: selectedTournamentVals?.teamId,
          competitionId: selectedTournamentVals?.competitionId,
        }
      );

      const remainingPlayers = response?.result?.remainingPlayers || [];
      const tournamentTeamPlayers =
        response?.result?.tournamentTeamPlayers || [];
      const options = remainingPlayers.map((player) => ({
        label: player.playerName,
        value: player.playerId,
      }));

      setPlayerList(options);
      setSelectedPlayers(
        tournamentTeamPlayers.map((player) => ({
          label: player.playerName,
          value: player.playerId,
        }))
      );
      setOriginalTournamentPlayers(tournamentTeamPlayers);
      setIsLoading(false);
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedTournamentVals?.teamId &&
      selectedTournamentVals?.competitionId
    ) {
      fetchData();
    }
  }, [selectedTournamentVals]);

  const getDropdownOptions = () => {
    if (playerList.length > 1) {
      return [
        { label: "Select All", value: "select-all" },
        ...playerList
      ];
    }
    return playerList;
  };

  const handlePlayerChange = (selectedOptions) => {
    // setSelectedPlayers(selectedOptions);
    const selectAllOption = selectedOptions?.find(option => option.value === "select-all");
  
    let newSelectedPlayers;
    
    if (selectAllOption) {
      newSelectedPlayers = [
        ...selectedPlayers, // Keep existing selected players
        ...playerList       // Add all remaining players
      ];
      
      newSelectedPlayers = newSelectedPlayers.filter((player, index, self) =>
        index === self.findIndex((p) => p.value === player.value)
      );
    } else {
      newSelectedPlayers = selectedOptions || [];
    }
    
    setSelectedPlayers(newSelectedPlayers);

    const selectedPlayersArray = newSelectedPlayers.map((option) => ({
      playerId: option.value,
      playerName: option.label,
      teamId: selectedTournamentVals.teamId,
      competitionId: selectedTournamentVals.competitionId,
    }));

    const addPlayers = selectedPlayersArray.filter(
      (player) => !originalTournamentPlayers.some((orig) => orig.playerId === player.playerId)
    ).map((player) => ({
      ...player,
    }));

    const removePlayers = originalTournamentPlayers.filter(
      (orig) => !selectedPlayersArray.some((player) => player.playerId === orig.playerId)
    ).map((player) => ({
      ...player,
    }));

    setSelectedTournament({teamId : selectedTournamentVals?.teamId, competitionId: selectedTournamentVals?.competitionId, teamPlayers: selectedPlayersArray, addPlayers, removePlayers});
  };

  return (
    <Modal
      isOpen={playersModelVisible}
      toggle={() => {
        setPlayersModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
      {isLoading && <SpinnerModel />}
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">
              Select Multi Players
            </h4>
            <div className="my-4">
              <span className="tournament-team-name">
                Team Name:
              </span>
              <span>{selectedTournamentVals?.teamName}</span>
            </div>
            <ReactSelect
              classNamePrefix="select2-selection"
              id="players"
              name="players"
              isMulti
              options={getDropdownOptions()}
              value={selectedPlayers}
              onChange={handlePlayerChange}
              required={true}
            />
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setPlayersModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleSelect();
              }}
            >
              Save
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
