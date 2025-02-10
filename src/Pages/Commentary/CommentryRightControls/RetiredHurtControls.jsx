import React, { useState } from "react";
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import "../CommentaryCss.css";
import CardComponent from "../CardComponent";
import {
  NON_STRIKE,
  ON_STRIKE,
  PLAYER_LIST,
  PREV_NON_STRIKE,
  PREV_ON_STRIKE,
  RETIRED_HURT_BATTER,
} from "../CommentartConst";
import SelectPlayerControls from "./SelectPlayerControls";
const RetiredHurtControls = ({
  toggle,
  onsubmit,
  playerList,
  onPitchPlayers,
  retiringHurtPartnership,
  allBattingPlayers,
}) => {
  const [changePlayerType, setChangePlayerType] = useState(false);

  const onSubmitClick = (newPlayerId) => {
    // console.log("newPlayerId", newPlayerId)
    const oldPlayer = onPitchPlayers[changePlayerType];
    let toSend = {
      ...onPitchPlayers,
      [RETIRED_HURT_BATTER]: { ...oldPlayer, isPlay: null, onStrike: null },
      [PREV_ON_STRIKE]: onPitchPlayers[ON_STRIKE],
      [PREV_NON_STRIKE]: onPitchPlayers[NON_STRIKE],
    };
    toSend[PLAYER_LIST] = allBattingPlayers.map((player) => {
      let updatedPlayer = player;
      if (player?.commentaryPlayerId === newPlayerId) {
        updatedPlayer = {
          ...player,
          isPlay: true,
          onStrike: changePlayerType === ON_STRIKE ? true : null,
        };
        toSend[changePlayerType] = updatedPlayer;
      }
      if (player?.commentaryPlayerId === oldPlayer?.commentaryPlayerId) {
        updatedPlayer = toSend[RETIRED_HURT_BATTER];
      }
      return updatedPlayer;
    });
    setChangePlayerType(null);

    if (typeof onsubmit !== "function") {
      console.error("onsubmit is not a function", onsubmit);
      return;
    }
    onsubmit(toSend);
  };

  return (
    <div className="col-12 d-flex flex-column m-0 p-0">
      {!changePlayerType && (
        <div className="col-6">
          <div>Retired Hurt</div>
          <div>Please select a batter:</div>
          <div
            className="col my-4"
            onClick={() => {setChangePlayerType(ON_STRIKE); retiringHurtPartnership()}}
          >
            <button
              className={`score-control-wicket-ball-btns ${
                changePlayerType == ON_STRIKE ? "active" : ""
              }`}
            >
              {onPitchPlayers?.[ON_STRIKE]?.playerName}
            </button>
          </div>
          <div
            className="col my-4"
            onClick={() => {setChangePlayerType(NON_STRIKE); retiringHurtPartnership()}}
          >
            <button
              className={`score-control-wicket-ball-btns ${
                changePlayerType == ON_STRIKE ? "active" : ""
              }`}
            >
              {onPitchPlayers?.[NON_STRIKE]?.playerName}
            </button>
          </div>
        </div>
      )}
      {changePlayerType && (
        <SelectPlayerControls
          isOpen={true}
          toggle={toggle}
          playerList={playerList}
          selectPlayer={onSubmitClick}
        />
      )}
    </div>
  );
};

export default RetiredHurtControls;
