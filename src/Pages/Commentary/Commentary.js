import { useEffect, useState } from "react"
import { CommentaryScreen } from "./Commentary.jsx"
import { isEqual } from "lodash"
import { BATTING_TEAM, BOWLING_TEAM } from "./CommentartConst.js"

const Commentary = (props) => {
    console.log(props.data)
    const [currentInnings, setCurrentInnings] = useState(undefined)
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)

    useEffect(() => {
        if (props.data) {
            const commentaryDetails = props.data.commentaryData.commentaryDetails
            const currentInningsTeams = {}
            const battingTeam = []
            const bowlingTeam = []
            props.data.commentaryData.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === 1
                    currentInningsTeams[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                }
            });
            props.data.commentaryData.commentaryPlayers.forEach(playerDetails => {
                if (isEqual(playerDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = playerDetails.teamId === currentInningsTeams[BATTING_TEAM].teamId
                    if (isBattingTeam) battingTeam.push(playerDetails)
                    else bowlingTeam.push(playerDetails)
                }
            });
            console.log(commentaryDetails.currentInnings, currentInningsTeams, battingTeam, bowlingTeam)
            setTeams(currentInningsTeams)
            setPlayers({ [BATTING_TEAM]: battingTeam, [BOWLING_TEAM]: bowlingTeam })
            setCurrentInnings(commentaryDetails.currentInnings)
        }
    }, [props.data])

    return <>
        <CommentaryScreen teamDetails={teams} playerDetails={players} />
    </>
}

export default Commentary