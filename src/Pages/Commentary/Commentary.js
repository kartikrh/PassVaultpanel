import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import { isEqual } from "lodash"
import { BALL_BYE, BALL_LEG_BYE, BALL_WIDE, BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, EXTRAS_LIST, FOUR, NON_STRIKE, NO_BALL, ON_STRIKE, SIX } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"
import ExtrasModal from "./CommentaryModels/ExtrasModal.jsx"
import ChangeOverModal from "./CommentaryModels/ChangeOverModal.jsx"
import WicketModal from "./CommentaryModels/WicketModal.jsx"

const Commentary = (props) => {
    const [currentInnings, setCurrentInnings] = useState(undefined)
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [changePlayerList, setChangePlayerList] = useState(undefined)
    const [extrasList, setExtrasList] = useState(undefined)
    const [extrasType, setExtrasType] = useState(undefined)
    const [playerToChange, setPlayerToChange] = useState(undefined)
    const [changeOverOnPopupClick, setChangeOverOnPopupClick] = useState(undefined)
    const [showChangeOverModal, setShowChangeOverModal] = useState(undefined)
    const [showWicketModal, setShowWicketModal] = useState(undefined)
    const matchTypeDetails = props.data.matchTypeData

    useEffect(() => {
        console.log(onPitchPlayers)
    })

    const checkForOverSwitch = (currentOver) => {
        console.log(matchTypeDetails)
        if (currentOver * 10 % 10 >= matchTypeDetails.ballsPerOver) {
            setShowChangeOverModal(true)
        }
    }

    useEffect(() => {
        if (changeOverOnPopupClick) {
            changePlayer(CURRENT_BOWLER)
            changeOver()
            setChangeOverOnPopupClick(undefined)
        }
    }, [changeOverOnPopupClick])

    useEffect(() => {
        if (props.data) {
            const commentaryDetails = props.data.commentaryData.commentaryDetails
            const currentInningsTeams = {}
            const battingTeam = []
            const bowlingTeam = []
            const onPitchPlayers = {}
            props.data.commentaryData.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === BAT
                    currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                }
            });
            props.data.commentaryData.commentaryPlayers.forEach(playerDetails => {
                if (isEqual(playerDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = playerDetails.teamId === currentInningsTeams[BATTING_TEAM].teamId
                    // If player is from batting team, add them to the batting object list
                    if (isBattingTeam) {
                        if (playerDetails.isPlay === true)
                            onPitchPlayers[playerDetails.onStrike === true ? ON_STRIKE : NON_STRIKE] = playerDetails
                        battingTeam.push(playerDetails)
                    }
                    // else add them to the bowling object list
                    else {
                        if (playerDetails.isPlay === true)
                            onPitchPlayers[CURRENT_BOWLER] = playerDetails
                        bowlingTeam.push(playerDetails)
                    }
                }
            });
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            setOnPitchPlayers(onPitchPlayers)
            setCurrentInnings(commentaryDetails.currentInnings)
        }
    }, [props.data])

    const updateRuns = ({ run, ball, batter, bowler, type, switchBatter }) => {
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        let isChangeStrike = undefined
        let updateOnPitchPlayer = {}

        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        checkForOverSwitch(updatedBowlerOver)
        updateBatter["batRun"] = (batter.batRun || 0) + run
        updateBatter["batBall"] = (batter.batBall || 0) + ball
        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + run
        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + ball
        updateBowler["bowlerOver"] = updatedBowlerOver
        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + run
        updateBattingTeam["teamOver"] =
            ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
        if (run === 0) {
            updateBatter["batDotBall"] = (batter.batDotBall || 0) + 1
            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) + 1
        } else if (run % 2 === 0) {
            if (type === FOUR) {
                updateBatter["batFour"] = (batter.batFour || 0) + 1
                updateBowler["bowlerFour"] = (bowler.bowlerFour || 0) + 1

            } else if (type === SIX) {
                updateBatter["batSix"] = (batter.batSix || 0) + 1
                updateBowler["bowlerSix"] = (bowler.bowlerSix || 0) + 1
            }
        } else isChangeStrike = true

        updateBatter = { ...onPitchPlayers[ON_STRIKE], ...updateBatter }
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        updateOnPitchPlayer = {
            [ON_STRIKE]: isChangeStrike ? onPitchPlayers[NON_STRIKE] : updateBatter,
            [NON_STRIKE]: isChangeStrike ? updateBatter : onPitchPlayers[NON_STRIKE],
            [CURRENT_BOWLER]: updateBowler
        }
        setOnPitchPlayers(updateOnPitchPlayer)
        setTeams({
            ...teams,
            [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam }
        })
    }

    const updateExtras = (type, runs) => {
        const bowler = onPitchPlayers[CURRENT_BOWLER]
        const updateBattingTeam = {}
        let updateBowler = {}
        const updatedBowlerOver = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        if (type === BALL_WIDE) {
            const runToUpdate = (+matchTypeDetails["valueOfWideBall"] || 0) + runs
            console.log(matchTypeDetails, (+matchTypeDetails["valueOfWideBall"] || 0))
            updateBowler["bowlerWideBall"] = (bowler.bowlerWideBall || 0) + 1
            updateBowler["bowlerWideBallRun"] = (bowler.bowlerWideBallRun || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
        } else if (type === NO_BALL) {
            const runToUpdate = (+matchTypeDetails["valueOfNoBall"] || 0) + runs
            updateBowler["bowlerNoBall"] = (bowler.bowlerNoBall || 0) + 1
            updateBowler["bowlerNoBallRun"] = (bowler.bowlerNoBallRun || 0) + runToUpdate
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runToUpdate
        }
        else {
            updateBowler["bowlerOver"] = updatedBowlerOver
            updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
            updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + runs
            updateBattingTeam["teamOver"] =
                ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)
            if (type === BALL_BYE) {
                updateBowler["bowlerByeBall"] = (bowler.bowlerByeBall || 0) + 1
                updateBowler["bowlerByeBallRun"] = (bowler.bowlerByeBallRun || 0) + runs
            }
            else if (type === BALL_LEG_BYE) {
                updateBowler["bowlerLegByeBall"] = (bowler.bowlerLegByeBall || 0) + 1
                updateBowler["bowlerLegByeBallRun"] = (bowler.bowlerLegByeBallRun || 0) + runs
            }
            checkForOverSwitch(updatedBowlerOver)
        }
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        setOnPitchPlayers({
            ...onPitchPlayers,
            [CURRENT_BOWLER]: updateBowler
        })
        setTeams({
            ...teams,
            [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam }
        })
    }

    const changeOver = () => {
        let bowler = onPitchPlayers[CURRENT_BOWLER]
        let updateBowler = {}
        let updateBattingTeam = {}
        updateBowler = { ...onPitchPlayers[CURRENT_BOWLER], ...updateBowler }
        updateBowler["bowlerOver"] = Math.ceil((+bowler.bowlerOver || 0))
        updateBattingTeam["teamOver"] =
            Math.ceil(+teams[BATTING_TEAM].teamOver || 0)
        setTeams({
            ...teams,
            [BATTING_TEAM]: { ...teams[BATTING_TEAM], ...updateBattingTeam }
        })
        setOnPitchPlayers({
            [ON_STRIKE]: onPitchPlayers[NON_STRIKE],
            [NON_STRIKE]: onPitchPlayers[ON_STRIKE],
            [CURRENT_BOWLER]: updateBowler
        })
    }

    const handleWicket = () => {

    }

    const onExtrasChange = (runFromModal) => {
        updateExtras(extrasType, runFromModal)
        setExtrasList(undefined)
        setExtrasType(undefined)
    }

    const onPlayerChange = (newPlayerId) => {
        const teamType = playerToChange === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM
        let newPlayer = undefined
        const playerToChangeId = onPitchPlayers[playerToChange]?.playerId
        setPlayers({
            ...players,
            [teamType]: players[teamType]?.map((player) => {
                if (isEqual(player.playerId, playerToChangeId))
                    return {
                        ...onPitchPlayers[playerToChange],
                        "isPlay": null,
                        "onStrike": null
                    }
                if (isEqual(player.playerId, newPlayerId)) {
                    newPlayer = player
                    return {
                        ...player,
                        "isPlay": true,
                        "onStrike": playerToChange === ON_STRIKE ? true : playerToChange === NON_STRIKE ? false : null
                    }
                } return player
            })
        })
        setOnPitchPlayers({ ...onPitchPlayers, [playerToChange]: newPlayer })
        setChangePlayerList(undefined)
        setPlayerToChange(undefined)
    }

    const changePlayer = (type) => {
        setPlayerToChange(type)
        setChangePlayerList(players[type === CURRENT_BOWLER ? BOWLING_TEAM : BATTING_TEAM]?.filter((player) =>
            player.isPlay === null))
    }

    return <>
        <CommentaryScreen
            teamDetails={teams}
            onPitchPlayers={onPitchPlayers}
            updateRuns={updateRuns}
            changePlayer={changePlayer}
            changeOver={() => {
                setShowChangeOverModal(true)
            }}
            updateExtras={(extraType) => {
                setExtrasType(extraType)
                setExtrasList(EXTRAS_LIST[extraType])
            }}
            onWicketClick={() => { showWicketModal(true) }}
        />
        <SelectPlayerModal isOpen={changePlayerList}
            toggle={() => { setChangePlayerList(undefined) }}
            playerList={changePlayerList}
            selectPlayer={onPlayerChange} />
        <ExtrasModal isOpen={extrasList}
            toggle={() => { setExtrasList(undefined) }}
            runList={extrasList}
            selectExtraRun={onExtrasChange} />
        <ChangeOverModal
            isOpen={showChangeOverModal}
            toggle={() => { setShowChangeOverModal(undefined) }}
            onNoClick={() => { setShowChangeOverModal(undefined) }}
            onYesClick={() => {
                setShowChangeOverModal(undefined);
                setChangeOverOnPopupClick(true)
            }} />
        <WicketModal isOpen={showWicketModal} toggle={() => { setShowWicketModal(undefined) }} onSubmit={handleWicket} />
    </>
}

export default Commentary