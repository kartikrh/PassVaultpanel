import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import { isEqual } from "lodash"
import { BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from "./CommentartConst.js"

const Commentary = (props) => {
    const [currentInnings, setCurrentInnings] = useState(undefined)
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})

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
            console.log(commentaryDetails.currentInnings, currentInningsTeams, onPitchPlayers)
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            setOnPitchPlayers(onPitchPlayers)
            setCurrentInnings(commentaryDetails.currentInnings)
        }
    }, [props.data])

    return <>
        <CommentaryScreen teamDetails={teams} playerDetails={players} onPitchPlayers={onPitchPlayers} />
    </>
}

export default Commentary