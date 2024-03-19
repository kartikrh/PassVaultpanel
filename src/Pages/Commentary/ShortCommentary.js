import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios"
import { updateToastData } from "../../Features/toasterSlice"
import { ERROR, PERMISSION_VIEW, STRING_SEPERATOR, TAB_COMMENTARY } from "../../components/Common/Const"
import ShortCommentaryScreen from "./ShortCommentary.jsx"
import SpinnerModel from "../../components/Model/SpinnerModel";
import { BAT, BATTING_TEAM, BOWLING_TEAM, CURRENT_BOWLER, NON_STRIKE, ON_STRIKE } from "./CommentartConst"
import { isEqual } from "lodash"
import { checkPermission } from "../../components/Common/Reusables/reusableMethods.js"
import { Col, Row } from "reactstrap"

const navigateTo = "/commentary"
export const ShortCommentary = () => {
    const pageName = TAB_COMMENTARY
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [teams, setTeams] = useState(undefined)
    const [players, setPlayers] = useState(undefined)
    const [onPitchPlayers, setOnPitchPlayers] = useState({})
    const [currentOver, setCurrentOver] = useState({})
    const [isLastInnigs, setIsLastInnings] = useState(undefined)
    const [matchTypeData, setMatchTypeData] = useState({});
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [formattedDetails, setFormattedDetails] = useState({})
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    const location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            Navigate("/dashboard")
        }
    }, []);

    const commentaryId = location.state?.commentaryId || "0";
    useEffect(() => {
        if (commentaryId !== "0") {
            fetchData(commentaryId);
        }
    }, [commentaryId]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
                setCommentaryData(commentaryDataToUpdate)
                setIsDataLoading(false)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
        formatData(commentaryDataToUpdate)
    };

    const findPlayersFormList = (commentaryData, innings, teamId) => {
        const toReturn = []
        commentaryData?.commentaryPlayers?.forEach(player => { if ((player.currentInnings === innings) && (player.teamId === teamId)) toReturn.push(player) })
        return toReturn
    }

    const formatData = (commentaryData) => {
        const formattedData = {}
        commentaryData?.commentaryTeams?.forEach(team => {
            const oppositTeam = isEqual(team.teamId, commentaryData.commentaryDetails.team1Id) ?
                commentaryData.commentaryDetails.team2Id : commentaryData.commentaryDetails.team1Id
            const key = team.currentInnings + STRING_SEPERATOR + team.teamId
            formattedData[key] = {
                ...team,
                "oppositeTeam": oppositTeam,
                "teamPlayers": findPlayersFormList(commentaryData, team.currentInnings, team.teamId),
                "bowlers": findPlayersFormList(commentaryData, team.currentInnings, oppositTeam)
            }
        });
        setFormattedDetails(formattedData)
    }
    const handleBackClick = () => {
        navigate(navigateTo);
    };
    return <>
        {isDataLoading && <SpinnerModel />}
        <Row>
            <Col>
                <div className='match-details-breadcrumbs'>{`${commentaryData.commentaryDetails.ety}/ ${commentaryData.commentaryDetails.com}/ ${commentaryData.commentaryDetails.en}`}</div>
                <div>{`Ref: ${commentaryData.commentaryDetails.eid} [ ${commentaryData.commentaryDetails.ed + " " + commentaryData.commentaryDetails.et} ]`}</div>
            </Col>
        </Row>
        <Row>
            <ShortCommentaryScreen
                commentaryData={commentaryData || {}}
                CommentaryFormatedData={formattedDetails || {}}
                totalInnings={matchTypeData.noOfIningsPerSide}
                backClick={handleBackClick}
            />
        </Row>
    </>
}