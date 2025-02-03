import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import ball from "../../../../src/assets/images/cricket-icons/cricket-ball.png";
import bat from "../../../../src/assets/images/cricket-icons/cricket-bat.png";
import allrounder from "../../../../src/assets/images/cricket-icons/cricket.png";
import keeper from "../../../../src/assets/images/cricket-icons/game.png";
import { useSelector } from "react-redux";

const SelectPlayerControls = ({
  playerList,
  toggle,
  isOpen,
  selectPlayer,
  isBowler,
  overPopUpForBowler,
}) => {
  const theme = useSelector((state) => state.layout.panelTheme);
  if (playerList && playerList.length > 0) {
    playerList = playerList.sort((a, b) =>
      a.playerName
        ?.trim()
        .localeCompare(b.playerName?.trim(), undefined, { sensitivity: "base" })
    );
  }
  const [players, setPlayers] = useState(playerList);
  const [isBowlerChange, setIsBowlerChange] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch("");
    setPlayers(playerList);
  }, [isOpen, playerList]);
  useEffect(() => {
    setIsBowlerChange(isBowler);
  }, [isBowler]);

  useEffect(() => {
    const filteredPlayers = playerList?.filter((value) =>
      value.playerName?.toLowerCase().includes(search.toLowerCase())
    );
    setPlayers(filteredPlayers);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const inputElement = document.getElementById("playerNameInput");
        if (inputElement) inputElement.focus();
      }, 150);
    }
  }, [isOpen]);

  const playerTypeOrder = {
    BatsMan: 1,
    Wicketkeeper: 2,
    AllRounder: 3,
    Bowler: 4,
  };

  // Sort by player type first, then player name alphabetically
  let sortedPlayers = players?.sort((a, b) => {
    // First, compare by playerType
    const typeCompare = isBowlerChange
      ? playerTypeOrder[b.playerType] - playerTypeOrder[a.playerType]
      : playerTypeOrder[a.playerType] - playerTypeOrder[b.playerType];
    if (typeCompare !== 0) return typeCompare;
    // If playerType is the same, compare alphabetically by playerName
    return a.playerName.localeCompare(b.playerName);
  });
  sortedPlayers = sortedPlayers?.filter((player) => player.isInPlayingEleven);

  const imageRender = (playerType) => {
    if (playerType === "BatsMan") {
      return (
        <img
          src="icons/bater.png"
          alt="bat"
          style={{ width: "30px", height: "30px" }}
        />
      );
    } else if (playerType === "Wicketkeeper") {
      return (
        <img
          src={keeper}
          alt="keeper"
          style={{ width: "30px", height: "30px" }}
        />
      );
    } else if (playerType === "AllRounder") {
      return (
        <img
          src={allrounder}
          alt="allrounder"
          style={{ width: "30px", height: "30px" }}
        />
      );
    } else {
      return (
        <img
          src="icons/bowler.png"
          alt="ball"
          style={{ width: "30px", height: "30px" }}
        />
      );
    }
  };
  return (
    <div className="col-12">
      {/* <div>Select Player</div> */}
      <div>
        <div className="col-6">
          <input
            id="playerNameInput"
            className="form-control mb-3"
            type="text"
            placeholder="Player Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className=" row row-cols-2 g-2 col-12">
          {sortedPlayers?.map((value) => (
          //   onClick={() => {
          //     setIsBowlerChange(false)
          //     selectPlayer(value.commentaryPlayerId)
          // }}
            <div
              key={value.commentaryPlayerId}
              className="col-6"
              onClick={() => {
                setIsBowlerChange(false);
                selectPlayer(value.commentaryPlayerId);
                toggle()
              }}
            >
              {/* {console.log("value", value)} */}
              <button className="player-names">
                <span className="pe-2">{imageRender(value.playerType)}</span>
                {value.playerName}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerControls;
