import React, { forwardRef, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, Table } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { updateToastData } from '../../Features/toasterSlice'
import { ERROR } from '../../components/Common/Const'
import CardComponent from './CardComponent'

const PlayerSelection = forwardRef((props, ref) => {
  document.title = "Player Selection | ScoreCard - React Admin & Dashboard Template";

  const { data, next, previous } = props;
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeamsDetails, setCommentaryTeamsDetails] = useState([]);
  const [commentaryTeamsPlayersDetails, setCommentaryTeamsPlayersDetails] = useState([]);

  const [battingteam, setBattingtema] = useState("");
  const [bowlingteam, setBowlingingtema] = useState("");

  const [battingteamplayer, setBattingtemaplayer] = useState([]);
  const [bowlingteamplayer, setBowlingingtemaplayer] = useState([]);
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
      const battingteam = commentaryTeamsDetails.filter(
        (team) => team.teamStatus === 1
      );
      const bowlingteam = commentaryTeamsDetails.filter(
        (team) => team.teamStatus === 2
      );
      if (battingteam.length > 0) setBattingtema(battingteam[0].teamId)
      if (bowlingteam.length > 0) setBowlingingtema(bowlingteam[0].teamId)
    }
  }, [commentaryTeamsDetails]);

  useEffect(() => {
    const bowlingingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (team) => team.teamId === bowlingteam
    );
    setBowlingingtemaplayer(bowlingingTeamPlayers);
  }, [bowlingteam]);

  useEffect(() => {
    const battingTeamPlayers = commentaryTeamsPlayersDetails.filter(
      (team) => team.teamId === battingteam
    );
    setBattingtemaplayer(battingTeamPlayers);
  }, [battingteam]);

  const openModel = (teamStatus, striker = true) => {
    setIsSelectingStriker(striker)
    setTeamListStatus(teamStatus)
    setModal(true)
  }

  const onPrevious = () => {
    const newData = { ...data };
    previous()
  }

  const getTeamList = () => {
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
              <h3>
                Player Selection
              </h3>
            </CardHeader>
            <CardBody>
              <CardTitle className="h4">
                <h3>
                  Please Select India Selects Opening Batsmen
                </h3>
              </CardTitle>
              <Row className='p-1 my-3'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Striker"}
                    check={selectedStriker?.playerName}
                    name={selectedStriker?.playerName}
                    onClick={() => openModel(1)}
                    icon={"bx bxs-check-circle"}
                    bgColor={"#24B9A2"}
                    onClickColor={"#0BB197"}
                    isPlayerName={true}
                  />

                  {/* <div className="bg-info m-1 py-5 rounded d-flex align-items-center p-3" style={{ height: "150px" }} onClick={() => openModel(1)}>
                    <div className='d-flex flex-column' >
                      <div className='d-flex align-items-center' >
                        <img
                          src="CommentaryIcons/CricketTeam.png"
                          alt="Cricketbatter "
                          title="Cricket batter "
                          className='mb-2'
                          width={40}
                          height={40}
                          class="lzy lazyload--done"
                        />
                        <span
                          style={{
                            fontSize: "20px",
                            marginLeft: "10px",
                            color: "white",
                          }}>
                          Select Striker
                        </span>
                      </div>
                      <div
                        className='mt-2'
                        style={{
                          fontSize: "20px",
                          marginLeft: "10px",
                          color: "white",
                        }}>
                        {selectedStriker?.playerName}
                      </div>
                    </div>
                  </div> */}
                </Col>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Non-Striker"}
                    check={selectedNonStriker?.playerName}
                    name={selectedNonStriker?.playerName}
                    onClick={() => openModel(1, false)}
                    icon={"bx bxs-check-circle"}
                    bgColor={"#FF5170"}
                    onClickColor={"#FF3D60"}
                    isPlayerName={true}
                  />

                  {/* <div className="bg-danger m-1 py-5 rounded d-flex align-items-center p-3" style={{ height: "150px" }} onClick={() => openModel(1, false)}>
                    <div className='d-flex flex-column' >
                      <div className='d-flex align-items-center' >
                        <img
                          src="CommentaryIcons/CricketTeam.png"
                          alt="Cricketbatter"
                          width={40}
                          height={40}
                        />
                        <span
                          style={{
                            fontSize: "20px",
                            marginLeft: "10px",
                            color: "white",
                          }}>
                          Select NonStriker
                        </span>
                      </div>
                      <div
                        className='mt-2'
                        style={{
                          fontSize: "20px",
                          marginLeft: "10px",
                          color: "white",
                        }}>
                        {selectedNonStriker?.playerName}
                      </div>
                    </div>
                  </div> */}
                </Col>
              </Row>
              <CardTitle className="h4">
                <h3>
                  Please Select Australia Selects Opening Bowler
                </h3>
              </CardTitle>
              <Row className='p-1 my-3'>
                <Col xs="12" sm="6">
                  <CardComponent
                    title={"Bowler"}
                    check={selectedBowler?.playerName}
                    name={selectedBowler?.playerName}
                    onClick={() => openModel(2)}
                    icon={"bx bxs-check-circle"}
                    bgColor={"#FCC042"}
                    onClickColor={"#FCB92C"}
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
              id="caret" color="primary" onClick={() => { next() }}>
              <span>Save & Next</span>
              <i class='bx bxs-right-arrow ms-1'></i>
            </Button>)}
          </Container>
        </Container>
        <Modal style={{ marginTop: "80px" }} zIndex={1000} isOpen={modal} toggle={toggle} scrollable>
          <ModalHeader toggle={toggle}>
            Select Player
          </ModalHeader>
          <ModalBody>
            <Table responsive>
              <thead>
                <tr className="table-secondary">
                  <th>
                    Player Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {getTeamList().map(value => <tr>
                  <td role='button' onClick={() => selectPlayer(value.playerId)} >{value.playerName}</td>
                </tr>)}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  )
})

export default PlayerSelection