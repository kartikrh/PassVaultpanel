import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import { isEqual } from "lodash"
import { BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, FOUR, NON_STRIKE, ON_STRIKE, SIX } from "./CommentartConst.js"
import SelectPlayerModal from "./CommentaryModels/SelectPlayerModal.jsx"

const Commentary = (props) => {
    const [currentInnings, setCurrentInnings] = useState(undefined)
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [changePlayerList, setChangePlayerList] = useState(undefined)
    const [playerToChange, setPlayerToChange] = useState(undefined)
    const matchTypeDetails = props.data.matchTypeData

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

    const updateRuns = (run, batter, bowler, type = "") => {
        const updateBattingTeam = {}
        let updateBatter = {}
        let updateBowler = {}
        let isChangeStrike = undefined
        let updateOnPitchPlayer = {}
        updateBatter["batRun"] = (batter.batRun || 0) + run
        updateBatter["batBall"] = (batter.batBall || 0) + 1
        updateBowler["bowlerRun"] = (bowler.bowlerRun || 0) + run
        updateBowler["bowlerTotalBall"] = (bowler.bowlerTotalBall || 0) + 1
        updateBowler["bowlerOver"] = ((+bowler.bowlerOver || 0) + 0.1).toFixed(1)
        updateBattingTeam["teamScore"] = (teams[BATTING_TEAM].teamScore || 0) + run
        updateBattingTeam["teamOver"] = ((+teams[BATTING_TEAM].teamOver || 0) + 0.1).toFixed(1)

        if (run === 0) {
            updateBatter["batDotBall"] = (batter.batDotBall || 0) + 1
            updateBowler["bowlerDotBall"] = (bowler.bowlerDotBall || 0) + 1
        }
        else
            if (run % 2 === 0) {
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
    const checkForOverSwitch = (currentOver) => {
        console.log(currentOver, matchTypeDetails)
    }
    // useEffect(() => {
    //     console.log(changePlayerList)
    // })

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
            // playerDetails={players}
            onPitchPlayers={onPitchPlayers}
            updateRuns={updateRuns}
            changePlayer={changePlayer}

        />
        <SelectPlayerModal isOpen={changePlayerList} toggle={() => { setChangePlayerList(undefined) }} playerList={changePlayerList} selectPlayer={onPlayerChange} />
    </>
}

export default Commentary