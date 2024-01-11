import React, { forwardRef, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { updateToastData } from '../../Features/toasterSlice'
import { ERROR, SAVE_AND_NEXT } from '../../components/Common/Const'
import CardComponent from './CardComponent'
import SelectPlayerModal from './SelectPlayerModal'
import axiosInstance from '../../Features/axios'

const PlayerSelection = forwardRef((props, ref) => {
  document.title = "Player Selection | ScoreCard - React Admin & Dashboard Template";

  const { data, next, previous, save } = props;
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeamsDetails, setCommentaryTeamsDetails] = useState([]);
  const [commentaryTeamsPlayersDetails, setCommentaryTeamsPlayersDetails] = useState([]);

  const [battingteam, setBattingteam] = useState(null);
  const [bowlingteam, setBowlingingteam] = useState(null);

  const [battingteamplayer, setBattingtemaplayer] = useState([]);
  const [bowlingteamplayer, setBowlingtemaplayer] = useState([]);
  const [teamListStatus, setTeamListStatus] = useState([]);
  const [isSelectingStriker, setIsSelectingStriker] = useState(true);

  const [selectedBowler, setSelectedBowler] = useState(null);
  const [selectedStriker, setSelectedStriker] = useState(null);
  const [selectedNonStriker, setSelectedNonStriker] = useState(null);

  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    if (data) {
      const commentaryDetails = data.commentaryDetails
      setCommentaryDetails(commentaryDetails);
      setCommentaryTeamsDetails(data.commentaryTeams);
      setCommentaryTeamsPlayersDetails(data.commentaryPlayers);
    }
  }, [data]);

  useEffect(() => {
    if (selectedBowler && selectedStriker && selectedNonStriker) {
      setIsNext(true);
    }
  }, [selectedBowler, selectedStriker, selectedNonStriker])

  useEffect(() => {
    if (commentaryTeamsDetails) {
      const battingteam = commentaryTeamsDetails.find(
        (team) => team.teamStatus === 1
      );
      const bowlingteam = commentaryTeamsDetails.find(
        (team) => team.teamStatus === 2
      );
      if (battingteam) setBattingteam(battingteam)
      if (bowlingteam) setBowlingingteam(bowlingteam)
    }
  }, [commentaryTeamsDetails]);

  useEffect(() => {
    const bowlingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (team) => team.teamId === bowlingteam?.teamId
    );
    setBowlingtemaplayer(bowlingTeamPlayers);
  }, [bowlingteam]);

  useEffect(() => {
    const battingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (team) => team.teamId === battingteam?.teamId
    );
    setBattingtemaplayer(battingTeamPlayers);
  }, [battingteam]);

  const openModel = (teamStatus, striker = true) => {
    setIsSelectingStriker(striker)
    setTeamListStatus(teamStatus)
    setModal(true)
  }

  const onPrevious = async () => {
    if (data) {
      const newData = { ...data };
      newData.commentaryDetails.commentaryStatus = 1;
      save(newData)
    }
    previous()
  }

  const onNext = async () => {
    if (data) {
      const isPlayPlayers = commentaryTeamsPlayersDetails.filter((player) => player.isPlay === true);

      if (isPlayPlayers.length !== 3) {
        return dispatch(updateToastData({ data: "Please Select Players", title: "Commentary", type: ERROR }));
      }
      const _bowlerPlayer = isPlayPlayers.find(
        (player) => player.isPlay === true && player.bowlerStatus === 1
      );
      const _strikerplayer = isPlayPlayers.find(
        (player) => player.isPlay === true && player.onStrike === true
      );
      const _nonstriker = isPlayPlayers.find(
        (player) => player.isPlay === true && player.onStrike === false
      );
      const commentaryOvers = {
        overId: "0",
        commentaryId: data?.commentaryDetails?.commentaryId,
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
        currentInnings: data?.commentaryDetails?.currentInnings,
      };
      axiosInstance
        .post(`/admin/commentary/saveDetails`, {
          commentaryOvers
        })
        .then((response) => {
          console.log("response", response);
          const overId = response?.result?.overdetails?.overId;
          if (overId) {
            const commentaryBallByBall = {
              commentaryBallByBallId: "0",
              commentaryId: data?.commentaryDetails?.commentaryId,
              teamId: bowlingteam.teamId,
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
              currentInnings: data?.commentaryDetails?.currentInnings,
            };
            const value = {
              commentaryDetails: data?.commentaryDetails,
              commentaryPlayers: isPlayPlayers,
              commentaryBallByBall,
            };
            value.commentaryDetails.commentaryStatus = 3;
            axiosInstance
              .post(`/admin/commentary/saveDetails`, value)
              .then((response) => {
                next()
              })
              .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
              });
          }
        })
        .catch((error) => {
          dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        });
    }
  }

  const getTeamList = (teamListStatus) => {
    let team = [];
    if (teamListStatus === 1 && battingteamplayer.length) { team = battingteamplayer }
    else if (teamListStatus === 2 && bowlingteamplayer.length) { team = bowlingteamplayer }
    return team
  }

  const selectPlayer = (playerId) => {
    const selectedPlayerIndex = commentaryTeamsPlayersDetails.findIndex(i => i.playerId === playerId);
    const selectedPlayer = commentaryTeamsPlayersDetails[selectedPlayerIndex];
    let updatedData = {};

    if (teamListStatus === 1 && isSelectingStriker) {
      if (selectedPlayer.playerId === selectedNonStriker?.playerId) {
        return dispatch(updateToastData({ data: `${selectedPlayer.playerName} is already selected as Non-Striker`, title: "Player Selection", type: ERROR }));
      }
      setSelectedStriker(selectedPlayer)
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: true,
      }
    } else if (teamListStatus === 1 && !isSelectingStriker) {
      if (selectedPlayer.playerId === selectedStriker?.playerId) {
        return dispatch(updateToastData({ data: `${selectedPlayer.playerName} is already selected as Striker`, title: "Player Selection", type: ERROR }));
      }
      setSelectedNonStriker(selectedPlayer)
      updatedData = {
        isPlay: true,
        isBatterOut: false,
        onStrike: false,
      }
    } else if (teamListStatus === 2) {
      setSelectedBowler(bowlingteamplayer.find(i => i.playerId === playerId))
      updatedData = {
        isPlay: true,
        bowlerOver: 1,
        bowlerStatus: 1,
      }
    }

    const updatedStrikerPlayerDetails = commentaryTeamsPlayersDetails.map(
      (player) => {
        if (player.playerId === selectedPlayer.playerId) {
          return {
            ...player,
            ...updatedData
          };
        }
        return player;
      }
    );
    setCommentaryTeamsPlayersDetails(updatedStrikerPlayerDetails);
    setModal(false);
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container >
          <Card className='shadow-none' >
            <CardHeader>
              <h2>
                Player Selection
              </h2>
            </CardHeader>
            <CardBody>
              <CardTitle className="h4">
                <h4>
                  Please Select {battingteam?.teamName} Opening Batter
                </h4>
              </CardTitle>
              <Row className='p-1 my-3'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Striker"}
                    check={selectedStriker?.playerName}
                    name={selectedStriker?.playerName}
                    onClick={() => openModel(1)}
                    bgColor={"#0BB197"}
                    onClickColor={"#007B64"}
                    isPlayerName={true}
                  />
                </Col>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Non-Striker"}
                    check={selectedNonStriker?.playerName}
                    name={selectedNonStriker?.playerName}
                    onClick={() => openModel(1, false)}
                    icon={"bx bxs-check-circle"}
                    bgColor={"#0BB197"}
                    onClickColor={"#007B64"}
                    isPlayerName={true}
                  />
                </Col>
              </Row>
              <CardTitle className="h4">
                <h4>
                  Please Select {bowlingteam?.teamName} Opening Bowler
                </h4>
              </CardTitle>
              <Row className='p-1 my-3'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Bowler"}
                    check={selectedBowler?.playerName}
                    name={selectedBowler?.playerName}
                    onClick={() => openModel(2)}
                    bgColor={"#FCC042"}
                    onClickColor={"#CB8F00"}
                    isPlayerName={true}
                  />
                  {/* <div className="bg-warning m-1 py-5 rounded d-flex align-items-center p-3" style={{ height: "150px" }} onClick={() => openModel(2)}>
                    <div className='d-flex flex-column' >
                      <div className='d-flex align-items-center' >
                        <img
                          src="CommentaryIcons/ball.png"
                          width={40}
                          height={40}
                        />
                        <span
                          style={{
                            fontSize: "20px",
                            marginLeft: "10px",
                            color: "white",
                          }}>
                          Bowler
                        </span>
                      </div>
                      <div
                        className='mt-2'
                        style={{
                          fontSize: "20px",
                          marginLeft: "10px",
                          color: "white",
                        }}>
                        {selectedBowler?.playerName}
                      </div>
                    </div>
                  </div> */}
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Container className='d-flex justify-content-between flex-wrap' >
            <Button
              className='m-2'
              id="caret" color="primary" onClick={onPrevious}>
              <i class='bx bxs-left-arrow me-1'></i>
              <span>Previous</span>
            </Button>
            {isNext && (<Button
              className='m-2 d-flex align-items-center'
              id="caret" color="primary" onClick={onNext}>
              <span>Save & Next</span>
              <i class='bx bxs-right-arrow ms-1'></i>
            </Button>)}
          </Container>
        </Container>
        <SelectPlayerModal modal={modal} toggle={toggle} playerList={getTeamList(teamListStatus)} selectPlayer={selectPlayer} />
      </div>
    </React.Fragment>
  )
})

export default PlayerSelection