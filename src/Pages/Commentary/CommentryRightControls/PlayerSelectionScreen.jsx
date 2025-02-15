import React, { forwardRef, useEffect, useState } from "react";
import Select from "react-select";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { clone } from "lodash";
import axiosInstance from "../../../Features/axios";
import SelectPlayerModal from "../CommentaryModels/SelectPlayerModal";
import {
  BATTING_STATUS,
  BOWLING_STATUS,
  ERROR,
  WARNING,
} from "../../../components/Common/Const";
import { updateToastData } from "../../../Features/toasterSlice";
import CardComponent from "../CardComponent";


const PlayerSelectionScreen = forwardRef((props, ref) => {
  document.title = "Player Selection";
  const { data, next, previous, save } = props;
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeamsDetails, setCommentaryTeamsDetails] = useState([]);
  const [commentaryTeamsPlayersDetails, setCommentaryTeamsPlayersDetails] =
    useState([]);
  const [currentInnings, setCurrentInnings] = useState(undefined);

  const [battingteam, setBattingteam] = useState(null);
  const [bowlingteam, setBowlingingteam] = useState(null);

  const [battingteamplayer, setBattingtemaplayer] = useState([]);
  const [bowlingteamplayer, setBowlingtemaplayer] = useState([]);
  const [teamListStatus, setTeamListStatus] = useState([]);
  const [isSelectingStriker, setIsSelectingStriker] = useState(true);

  const [selectedBowler, setSelectedBowler] = useState(null);
  const [selectedStriker, setSelectedStriker] = useState(null);
  const [selectedNonStriker, setSelectedNonStriker] = useState(null);
  const [playersToUpdate, setPlayersToUpdate] = useState([]);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    if (data) {
      const commentaryDetails = data.commentaryDetails;
      const newPlayerToUpdate = [];
      const updatedPlayers = data.commentaryPlayers?.map((player) => {
        if (player.isPlay) {
          newPlayerToUpdate.push(player);
          return { ...player, isPlay: null };
        }
        if (player.onStrike) {
          newPlayerToUpdate.push(player);
          return { ...player, onStrike: null };
        }
        return player;
      });
      setPlayersToUpdate(newPlayerToUpdate);
      setCommentaryDetails(commentaryDetails);
      setCurrentInnings(commentaryDetails?.currentInnings);
      setCommentaryTeamsDetails(data.commentaryTeams);
      setCommentaryTeamsPlayersDetails(updatedPlayers);
    }
  }, [data]);

  useEffect(() => {
    if (selectedBowler && selectedStriker && selectedNonStriker) {
      setIsNext(true);
    }
  }, [selectedBowler, selectedStriker, selectedNonStriker]);

  useEffect(() => {
    if (commentaryTeamsDetails) {
      const battingteam = commentaryTeamsDetails.find(
        (team) =>
          team.teamStatus === 1 && team.currentInnings === currentInnings
      );
      const bowlingteam = commentaryTeamsDetails.find(
        (team) =>
          team.teamStatus === 2 && team.currentInnings === currentInnings
      );
      if (battingteam) setBattingteam(battingteam);
      if (bowlingteam) setBowlingingteam(bowlingteam);
    }
  }, [commentaryTeamsDetails]);

  useEffect(() => {
    const bowlingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (player) =>
        player.teamId === bowlingteam?.teamId &&
        player.currentInnings === currentInnings
    );
    setBowlingtemaplayer(bowlingTeamPlayers);
  }, [bowlingteam]);

  useEffect(() => {
    const battingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (player) =>
        player.teamId === battingteam?.teamId &&
        player.currentInnings === currentInnings
    );
    setBattingtemaplayer(battingTeamPlayers);
  }, [battingteam]);

  const openModel = (teamStatus, striker = true) => {
    setIsSelectingStriker(striker);
    setTeamListStatus(teamStatus);
    // setIsOpen(true)
  };

  const onNext = async () => {
    if (data) {
      const isPlayPlayers = [];
      const otherPlayers = [];
      commentaryTeamsPlayersDetails.forEach((player) => {
        if (player.isPlay) isPlayPlayers.push(player);
        else otherPlayers.push(player);
      });
      if (isPlayPlayers.length !== 3) {
        return dispatch(
          updateToastData({
            data: "Please Select Players",
            title: "Commentary",
            type: ERROR,
          })
        );
      }
      const _bowlerPlayer = isPlayPlayers.find(
        (player) =>
          player.isPlay === true && bowlingteam?.teamId === player.teamId
      );
      const _strikerplayer = isPlayPlayers.find(
        (player) =>
          player.isPlay === true &&
          player.onStrike === true &&
          battingteam?.teamId === player.teamId
      );
      const _nonstriker = isPlayPlayers.find(
        (player) =>
          player.isPlay === true &&
          player.onStrike === false &&
          battingteam?.teamId === player.teamId
      );
      const commentaryOvers = {
        overId: "0",
        commentaryId: commentaryDetails?.commentaryId,
        teamId: bowlingteam?.teamId,
        over: 0,
        ballCount: 0,
        bowlerId: _bowlerPlayer?.commentaryPlayerId,
        totalRun: 0,
        totalFour: 0,
        totalSix: 0,
        totalWideBall: 0,
        totalWideRun: 0,
        totalNoball: 0,
        totalNoBallRun: 0,
        totalByesRun: 0,
        totalLegByesRun: 0,
        totalPanelty: 0,
        totalWicket: 0,
        dotBall: 0,
        isComplete: false,
        powerplay: false,
        isOverInPowerplay: false,
        powerplayType: 1,
        isMaiden: false,
        date: "",
        isDelete: false,
        currentInnings: currentInnings,
      };
      axiosInstance
        .post(`/admin/commentary/saveDetails`, {
          commentaryId: commentaryDetails.commentaryId,
          commentaryOvers,
        })
        .then((response) => {
          const overId = response?.result?.overdetails?.overId;
          if (overId) {
            const commentaryBallByBall = {
              commentaryBallByBallId: "0",
              commentaryId: commentaryDetails?.commentaryId,
              teamId: battingteam.teamId,
              overId: overId,
              overCount: 0,
              currentOverBalls: 0,
              bowlerId: _bowlerPlayer.commentaryPlayerId,
              batStrikeId: _strikerplayer?.commentaryPlayerId,
              batNonStrikeId: _nonstriker?.commentaryPlayerId,
              ballIsCount: true,
              ballType: 0,
              ballIsDot: false,
              ballRun: 0,
              ballExtraRun: 0,
              ballIsBoundry: false,
              ballFour: 0,
              ballSix: 0,
              ballIsWicket: false,
              ballWicketType: 0,
              ballPlayerId: "0",
              ballBowlerId: 0,
              ballFielderId1: 0,
              ballFielderId2: 0,
              overIsMaiden: false,
              nextBatStrikeId: _strikerplayer?.commentaryPlayerId,
              nextBatNonStrikeId: _nonstriker?.commentaryPlayerId,
              currentInnings: currentInnings,
            };
            const newData = {
              commentaryId: commentaryDetails.commentaryId,
              commentaryDetails: clone(commentaryDetails),
              commentaryPlayers: [].concat(
                isPlayPlayers || [],
                playersToUpdate || []
              ),
              commentaryBallByBall,
            };
            const commentaryStatus = 3;
            newData.commentaryDetails.commentaryStatus = commentaryStatus;
            save(newData, commentaryStatus, {
              ...data,
              ...newData,
              commentaryPlayers: [...isPlayPlayers, ...otherPlayers],
              commentaryOvers: [{ ...commentaryOvers, overId }],
            });
          }
          if (response?.result?.callPredictions?.length > 0) {
            response.result.callPredictions.forEach((prediction) => {
              if (prediction?.predictioncallSuccess === false) {
                const predictionMessage = prediction?.predictionMessage;
                const endPoint = prediction?.endPoint;
                dispatch(
                  updateToastData({
                    data: `${endPoint}\n${predictionMessage}`,
                    title: prediction?.predictioonAPI,
                    type: WARNING,
                  })
                );
              }
            });
          }
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
    }
  };

  const playerTypeOrder = {
    "BatsMan": 1,
    "Wicketkeeper": 2,
    "AllRounder": 3,
    "Bowler": 4
};

  const getTeamList = (teamListStatus) => {
    let team = [];

    if (teamListStatus === 1 && battingteamplayer.length) {
      team = battingteamplayer.sort((a, b) =>
        a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, {
          sensitivity: "base",
        })
      );
    } else if (teamListStatus === 2 && bowlingteamplayer.length) {
      team = bowlingteamplayer.sort((a, b) =>
        a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, {
          sensitivity: "base",
        })
      );
    }

    if (team.length) {
      team = team
        .filter((player) => player.isInPlayingEleven) // Filter players in playing XI
        .sort((a, b) => {
          // Sort by playerType first
          const typeCompare = (teamListStatus == 2)
            ? playerTypeOrder[b.playerType] - playerTypeOrder[a.playerType]
            : playerTypeOrder[a.playerType] - playerTypeOrder[b.playerType];

          if (typeCompare !== 0) return typeCompare;

          // If playerType is the same, sort alphabetically by playerName
          return a.playerName
            ?.trim()
            .localeCompare(b.playerName?.trim(), undefined, {
              sensitivity: "base",
            });
        });
    }

    return team;
  };

  const selectPlayer = (commentaryPlayerId) => {
    const selectedPlayerIndex = commentaryTeamsPlayersDetails.findIndex(
      (i) =>
        i.commentaryPlayerId === commentaryPlayerId &&
        i.currentInnings === currentInnings
    );
    const selectedPlayer = commentaryTeamsPlayersDetails[selectedPlayerIndex];
    let updatedData = {};
    let oldCommentaryPlayerIds = [];
    const defaultValue = {
      isPlay: null,
      isBatterOut: null,
      onStrike: null,
      bowlerOver: null,
    };
    if (teamListStatus === 1 && isSelectingStriker) {
      if (
        selectedPlayer.commentaryPlayerId ===
        selectedNonStriker?.commentaryPlayerId
      ) {
        return dispatch(
          updateToastData({
            data: `${selectedPlayer.playerName} is already selected as Non-Striker`,
            title: "Player Selection",
            type: ERROR,
          })
        );
      }
      setSelectedStriker(selectedPlayer);
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: true,
      };

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails
        .filter(
          (i) =>
            i.isPlay === true &&
            i.isBatterOut === false &&
            i.onStrike === true &&
            i.currentInnings === currentInnings
        )
        .map((i) => i.commentaryPlayerId);
    } else if (teamListStatus === 1 && !isSelectingStriker) {
      if (
        selectedPlayer.commentaryPlayerId ===
        selectedStriker?.commentaryPlayerId
      ) {
        return dispatch(
          updateToastData({
            data: `${selectedPlayer.playerName} is already selected as Striker`,
            title: "Player Selection",
            type: ERROR,
          })
        );
      }
      setSelectedNonStriker(selectedPlayer);
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: false,
      };

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails
        .filter(
          (i) =>
            i.isPlay === true &&
            i.isBatterOut === false &&
            i.onStrike === false &&
            i.currentInnings === currentInnings
        )
        .map((i) => i.commentaryPlayerId);
    } else if (teamListStatus === 2) {
      setSelectedBowler(
        bowlingteamplayer.find(
          (i) => i.commentaryPlayerId === commentaryPlayerId
        )
      );
      updatedData = {
        isPlay: true,
        bowlerOver: 0,
      };

      oldCommentaryPlayerIds = commentaryTeamsPlayersDetails
        .filter(
          (i) =>
            i.isPlay === true &&
            i.bowlerOver === 0 &&
            i.currentInnings === currentInnings
        )
        .map((i) => i.commentaryPlayerId);
    }

    const updatedStrikerPlayerDetails = commentaryTeamsPlayersDetails.map(
      (player) => {
        if (
          player.commentaryPlayerId === selectedPlayer.commentaryPlayerId &&
          player.currentInnings === currentInnings
        ) {
          return {
            ...player,
            ...updatedData,
          };
        } else if (oldCommentaryPlayerIds.includes(player.commentaryPlayerId)) {
          return {
            ...player,
            ...defaultValue,
          };
        }
        return player;
      }
    );
    setCommentaryTeamsPlayersDetails(updatedStrikerPlayerDetails);
    setIsOpen(false);
  };

  const theme = useSelector((state) => state.layout.panelTheme);

  const imageRender = (playerType) => {
    if (playerType === "BatsMan") {
        return <img src={'icons/bater.png'} alt="bat" style={{ width: "20px", height: "20px" }} className="me-2" />
    } else if (playerType === "Wicketkeeper") {
        return <img src={'icons/bowler.png'} alt="keeper" style={{ width: "20px", height: "20px" }} className="me-2" />
    }
    else if (playerType === "AllRounder") {
        return <img src={'icons/bowler.png'} alt="allrounder" style={{ width: "20px", height: "20px" }} className="me-2" />
    } else {
        return <img src={'icons/bowler.png'} alt="ball" style={{ width: "20px", height: "20px" }} className="me-2" />
    }
  }

  const generatePlayerOptions = (teamListStatus, isStriker = true) => {
    return getTeamList(teamListStatus, isStriker).map((player) => ({
      value: player.commentaryPlayerId,
      label: player.playerName,
      image: player.playerType, // Assuming player has an image URL
    }));
  };
  
  const strikerOptions = generatePlayerOptions(teamListStatus, true);
  const nonStrikerOptions = generatePlayerOptions(teamListStatus, false);
  return (
    <React.Fragment>
        <div className="col-6 control-card bg-secondary m-4">
          <div className="shadow-none toss-card my-4 mx-2">
            <div className="toss-card-header">
              <h5 className="modal-header-title">Player Selection</h5>
            </div>
            <div>
              <div className="mt-4">
                <span className="gray-text">Please Select {battingteam?.teamName} Opening Batter</span>
              </div>
              <div className="p-1 d-flex row row-cols-2 g-2 col-12">
                <div
                  className="col-6"
                  onClick={() => openModel(BATTING_STATUS)}
                >
                  <Select
                    placeholder="Striker"
                    classNamePrefix="score-player-dropdown"
                    onChange={(selectedOption) =>
                      selectPlayer(selectedOption.value)
                    }
                    options={strikerOptions}
                    getOptionLabel={(e) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {imageRender(e.image)}
                        {e.label}
                      </div>
                    )}
                  />
                </div>
                <div
                  className="col-6"
                  onClick={() => openModel(BATTING_STATUS, false)}
                >
                  <Select
                    placeholder="Non Striker"
                    classNamePrefix="score-player-dropdown"
                    onChange={(selectedOption) =>
                      selectPlayer(selectedOption.value)
                    }
                    options={nonStrikerOptions}
                    getOptionLabel={(e) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {imageRender(e.image)}
                        {e.label}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4">
                <span className="gray-text">Please Select {bowlingteam?.teamName} Opening Bowler</span>
              </div>
              <div className="p-1 d-flex row row-cols-2 g-2 col-12">
                <div
                  className="col-6"
                  onClick={() => openModel(BOWLING_STATUS)}
                >
                  <Select
                    placeholder="Bowler"
                    classNamePrefix="score-player-dropdown"
                    onChange={(selectedOption) =>
                      selectPlayer(selectedOption.value)
                    }
                    options={strikerOptions}
                    getOptionLabel={(e) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {imageRender(e.image)}
                        {e.label}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between flex-wrap">
            {isNext && (
              <Button
                className="m-2 d-flex align-items-center"
                id="caret"
                color="primary"
                onClick={onNext}
              >
                <span>Save & Next</span>
                <i className="bx bxs-right-arrow ms-1"></i>
              </Button>
            )}
          </div>
        </div>
    </React.Fragment>
  );
});

export default PlayerSelectionScreen;
