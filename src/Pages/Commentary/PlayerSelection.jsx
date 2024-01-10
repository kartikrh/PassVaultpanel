import React, { forwardRef, useEffect, useState } from 'react'
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Row, Table } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { updateToastData } from '../../Features/toasterSlice'
import { ERROR } from '../../components/Common/Const'

const PlayerSelection = forwardRef((props, ref) => {
  const { data } = props;
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

  useEffect(() => {
    if (data) {
      const commentaryDetails = data.commentaryDetails
      setCommentaryDetails(commentaryDetails);
      setCommentaryTeamsDetails(data.commentaryTeams);
      setCommentaryTeamsPlayersDetails(data.commentaryPlayers);
    }
  }, [data]);

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
        isPlay: false,
        bowlerStatus: 1,
        onStrike: false,
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
      <button onClick={() => { props.next() }}>Next </button>
      <button onClick={() => { props.previous() }}>Previous </button>
      <div className="page-content">
        <Nav pills className="nav nav-pills mt-4">
          <NavItem style={{ cursor: "pointer", width: "50%" }}>
            <NavLink
              style={{ textAlign: "center" }}
              onClick={() => { props.previous() }}
            >
              <i className="dripicons-home me-1 align-middle"> </i>{" "}
              Select Toss
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: "pointer", width: "50%" }}>
            <NavLink
              style={{ textAlign: "center" }}
              className="active"
            >
              <i className="dripicons-user me-1 align-middle"></i>{" "}
              Batter - Bowler
            </NavLink>
          </NavItem>
        </Nav>
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody>
                <Row>
                  <Col sm="6">
                    <Card inverse>
                      <Button className="d-flex align-items-center p-3 border-0" style={{ backgroundColor: "#F1556C", height: "150px" }} onClick={() => openModel(1)}>
                        <div className='d-flex flex-column' >
                          <img
                            src="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                            data-src="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                            alt="Cricketbatter "
                            title="Cricket batter "
                            className='mb-2'
                            width="64"
                            height="64"
                            class="lzy lazyload--done"
                            srcset="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                          />
                          <div>
                            Select Striker {selectedStriker && `>> ${selectedStriker.playerName}`}
                          </div>
                        </div>
                      </Button>
                    </Card>
                  </Col>
                  <Col sm="6">
                    <Card inverse>
                      <Button className="d-flex align-items-center p-3 border-0" style={{ backgroundColor: "#F672A7", height: "150px" }} onClick={() => openModel(1, false)}>
                        <div className='d-flex flex-column' >
                          <img
                            src="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                            data-src="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                            alt="Cricketbatter "
                            title="Cricket batter "
                            className='mb-2'
                            width="64"
                            height="64"
                            class="lzy lazyload--done"
                            srcset="https://cdn-icons-png.flaticon.com/128/2865/2865157.png"
                          />
                          <div>
                            Select NonStriker {selectedNonStriker && `>> ${selectedNonStriker.playerName}`}
                          </div>
                        </div>
                      </Button>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Card inverse>
                      <Button className="d-flex align-items-center p-3 border-0" style={{ backgroundColor: "#F7B84B", height: "150px" }} onClick={() => openModel(2)}>
                        <div className='d-flex flex-column'>
                          <img
                            srcset="https://cdn-icons-png.flaticon.com/128/5140/5140351.png 1x, https://cdn-icons-png.flaticon.com/128/5140/5140351.png 2x"
                            width="30"
                            height="30"
                            alt="Cricketer icon"
                            className='mb-2'
                            data-v-b4b8095a=""
                          />
                          <div>
                            Bowler {selectedBowler && `>> ${selectedBowler.playerName}`}
                          </div>
                        </div>
                      </Button>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Row>
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