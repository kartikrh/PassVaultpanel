import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Avatar,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import _, { isEmpty } from 'lodash';
import { generateBallLabelFromBall } from '../functions';
import PlayerImage from '../../../components/Common/Reusables/PlayerImage';
import { BATTING_TEAM } from '../CommentartConst';
import { Col, Row } from 'reactstrap';
import EditWicketDetails from '../CommentaryModels/EditWicketModal';
import { convertTimeUTCToLocal } from '../../../components/Common/Reusables/reusableMethods';

// Styled components remain the same
// const BallBox = styled(Box)(({ theme, balltype }) => ({
//     width: '24px',
//     height: '24px',
//     borderRadius: '4px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: '0 2px',
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: '12px',
//     backgroundColor:
//         balltype === 'wicket' ? '#dc3545' :
//             balltype === 'boundary' ? '#28a745' :
//                 balltype === 'extra' ? '#ffc107' :
//                     '#f8f9fa',
//     '&.boundary': { color: '#fff' },
//     '&.wicket': { color: '#fff' }
// }));

const OverContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderBottom: '1px solid #eee',
    '&:last-child': { borderBottom: 'none' },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '8px'
    },
}));

const PlayerInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '20%',
    minWidth: '150px',
    gap: '8px',
    order: 1,
    [theme.breakpoints.down('sm')]: {
        order: 1, // Reorder on small devices
    },
}));

const BallsContainer = styled(Box)(({ theme }) => ({
    width: '70%',
    padding: '0 16px',
    order: 2,
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        order: 3,
        padding: '8px 0px',
        marginTop: '8px', // Adds spacing from the previous row
    },
}));

const RunsInfo = styled(Box)(({ theme }) => ({
    width: '10%',
    minWidth: '60px',
    textAlign: 'right',
    order: 3,
    [theme.breakpoints.down('sm')]: {
        order: 2, // Reorder on small devices
        textAlign: 'left', // Optional: adjust text alignment for better UX
    },
}));


const OversAccordion = ({ overBalls, teamDetails, overHistory, playersList, currentOver, allteams }) => {
    // console.log({ overBalls, teamDetails, overHistory, playersList, currentOver, allteams })
    // const viewportWidth = window.innerWidth;
    const [viewportWidth, setViewportWidth] = useState();
    const [expanded, setExpanded] = useState(false);
    const [editWicketId, setEditWicketId] = useState(undefined);
    const [hasInitialized, setHasInitialized] = useState(false); // ✅ to track one-time init

    // New state for individual over accordions within teams
    const [overExpanded, setOverExpanded] = useState(new Map());

    const processedHistory = React.useMemo(() => {
        if (!overHistory?.length) return [];

        // Sort by overId in descending order
        const sortedHistory = _.orderBy(overHistory, ['overId'], ['desc']);

        if (!currentOver) return sortedHistory;

        // Remove the last over if it matches currentOver
        const latestHistoryOver = sortedHistory[0];
        if (latestHistoryOver &&
            latestHistoryOver.over === currentOver.over &&
            latestHistoryOver.currentInnings === currentOver.currentInnings &&
            latestHistoryOver.teamId === currentOver.teamId) {
            return [currentOver, ...sortedHistory.slice(1)];
        }

        return sortedHistory;
    }, [overHistory, currentOver]);

    // Group overs by innings and team
    const groupedOvers = React.useMemo(() => {
        if (!overBalls) return {};
        return _.groupBy(Object.entries(overBalls), ([key]) => {
            const [innings, teamId] = key.split('_##_');
            return `${innings}_${teamId}`;
        });
    }, [overBalls]);

    // Get default expanded key from currentOver
    // const defaultExpandedKey = React.useMemo(() => {
    //     if (!currentOver) return '1_1';
    //     return `${currentOver.currentInnings}_1`;
    // }, [currentOver]);

    // Sort keys to put current batting team first
    const sortedKeys = allteams.sort((a, b) => b.teamBattingOrder - a.teamBattingOrder)?.map((item) => `${item.currentInnings}_${item.teamId}`)

    // const sortedKeys = Object.keys(groupedOvers).sort((a, b) => {
    //     const [inningsA, teamIdA] = a.split('_');
    //     const [inningsB, teamIdB] = b.split('_');

    //     if (currentOver) {
    //         const isCurrentA = inningsA === currentOver.currentInnings.toString() &&
    //             teamIdA === currentOver.teamId.toString();
    //         const isCurrentB = inningsB === currentOver.currentInnings.toString() &&
    //             teamIdB === currentOver.teamId.toString();

    //         if (isCurrentA) return 1;
    //         if (isCurrentB) return -1;
    //     }

    //     return b.localeCompare(a);
    // });


    useEffect(() => {
        if (!hasInitialized && sortedKeys.length > 0) {
            setExpanded(sortedKeys[0]);
            setHasInitialized(true); // ✅ prevent future runs
        }
    }, [sortedKeys, hasInitialized]);

    useEffect(() => {
        if (sortedKeys.length > 0 && (!expanded || expanded == undefined)) {
            setExpanded(sortedKeys[0]);
        }
    }, []);

    // Initialize over-level accordion states - open latest 3 overs for each team
    useEffect(() => {
        if (groupedOvers && Object.keys(groupedOvers).length > 0) {
            const newOverExpanded = new Map();

            Object.entries(groupedOvers).forEach(([teamKey, overs]) => {
                // Sort overs by over number descending (latest first)
                const sortedOvers = overs.sort((a, b) => {
                    const overNumA = parseFloat(a[0].split('_##_')[2]);
                    const overNumB = parseFloat(b[0].split('_##_')[2]);
                    return overNumB - overNumA;
                });

                // Open first 3 overs (latest)
                sortedOvers.slice(0, 3).forEach(([overKey]) => {
                    newOverExpanded.set(overKey, true);
                });
            });

            setOverExpanded(newOverExpanded);
        }
    }, [groupedOvers]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Handler for individual over accordions
    const handleOverChange = (overKey) => (event, isExpanded) => {
        setOverExpanded(prev => {
            const newMap = new Map(prev);
            newMap.set(overKey, isExpanded);
            return newMap;
        });
    };

    const getPlayerDetails = (bowlerId) => {
        if (!bowlerId) return null;

        // Look in both teams for the bowler
        const bowlerList = [...(playersList?.BATTING_TEAM || []), ...(playersList?.BOWLING_TEAM || [])];
        return bowlerList.find(player => player.commentaryPlayerId === bowlerId);
    };

    const getOverDetails = (overNum, innings, teamId) => {
        // Find the over in processed history
        const over = processedHistory.find(oh =>
            (oh.over + 1) === Math.floor(parseFloat(overNum)) &&
            oh.currentInnings.toString() === innings &&
            oh.teamId.toString() !== teamId
        );

        return over || null;
    };

    const generateBallfromArray = (ballArray = []) => {
        // console.log(ballArray)
        return ballArray?.map((element, index) => {
            const previousValue = ballArray[index - 1]
            const nextValue = ballArray[index + 1]
            const isWicket = +element?.isWicket !== 0
            const isBoundary = +element?.value === 6 || +element?.value === 4
            // const isBoundary = +element?.isBoundary !== 0
            const ballTypeAdd = generateBallLabelFromBall(element?.type, isWicket)
            const ballColor = isWicket ? "wicket-overball" : ballTypeAdd ? "extra-overball" : isBoundary ? "boundary-overball" : "regular-overball"
            // const ballFontColor = isWicket ? "text-white" : ballTypeAdd ? "text-white" : isBoundary ? "text-white" : "text-muted"
            const ballValue = ballTypeAdd ?
                element.value > 0 ?
                    element.value : ""
                : element.value
            if (previousValue && previousValue.isWicket && previousValue?.overCount === element?.overCount) {
                return null;
            }
            let displayValue
            if (isWicket && nextValue && nextValue?.overCount === element?.overCount) {
                const nextIsWicket = +nextValue?.isWicket !== 0
                const nextBallTypeAdd = generateBallLabelFromBall(nextValue?.type, nextIsWicket)
                const nextBallValue = nextBallTypeAdd ?
                    nextValue.value > 0 ?
                        nextValue.value : ""
                    : nextValue.value
                displayValue = `${nextBallValue} ${(nextBallTypeAdd && nextBallValue) ? "|" : ""}${nextBallTypeAdd || ""}W`
            } else {
                displayValue = `${ballValue} ${(ballTypeAdd && ballValue) ? "| " : ""} ${ballTypeAdd || ""}`;
            }
            const batter = getPlayerDetails(element.batterId)?.playerName
            return (
                <Row className={`d-flex w-100 ${isWicket ? "cursor-pointer" : "cursor-default"}`}>
                    <Col xs={2} md={2} lg={2}>{parseFloat(element.overCount).toFixed(1)}</Col>
                    <Col xs={1} md={1} lg={1}
                        onClick={() => {
                            if (!isWicket) return;
                            setEditWicketId(element.wicketId)
                        }}
                        className={` d-flex justify-content-center align-items-center ${ballColor}`}>
                        {displayValue}
                    </Col>
                    <Col xs={5} md={5} lg={5} className="px-4">
                        {`To ${batter}`}
                    </Col>
                    <Col xs={4} md={4} lg={4} className="px-4">
                        {convertTimeUTCToLocal(element?.createdDate, "index")}
                    </Col>
                </Row>
            )
        })
    }

    useEffect(() => {
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Set initial width
        handleResize();

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const renderOver = (balls, overKey, team) => {
        // const viewportWidth = window.innerWidth;
        return (<>
            {viewportWidth < 578 ?
                <OverContainer className='accordian-container'>
                    <BallsContainer>
                        <Box display="flex" flexWrap="wrap" gap={1} >
                            <React.Fragment >
                                <div className='d-inline-block'>
                                    {generateBallfromArray(balls)}
                                </div>
                            </React.Fragment>
                        </Box>
                    </BallsContainer>
                </OverContainer>
                : <OverContainer className='accordian-container'>
                    <BallsContainer>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            <React.Fragment >
                                {generateBallfromArray(balls)}
                            </React.Fragment>
                        </Box>
                    </BallsContainer>
                </OverContainer>}
        </>
        );
    };

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {sortedKeys.map(key => {
                    const [innings, teamId] = key.split('_');
                    const team = teamId === teamDetails.BATTING_TEAM.teamId.toString()
                        ? teamDetails.BATTING_TEAM
                        : teamDetails.BOWLING_TEAM;
                    const jersy = teamId === teamDetails.BATTING_TEAM.teamId.toString()
                        ? teamDetails.BOWLING_TEAM
                        : teamDetails.BATTING_TEAM
                    return !isEmpty(groupedOvers[key]) && (
                        <Accordion
                            // defaultExpanded
                            className='right-panel-over-accordian'
                            key={key}
                            // disabled
                            expanded={sortedKeys.length > 1 ? expanded === key : expanded}
                            onChange={handleChange(key)}
                            sx={{
                                '&:before': { display: 'none' },
                                boxShadow: 'none',
                                '& .MuiAccordionSummary-root': {
                                    borderBottom: '1px solid #eee'
                                }
                            }}
                        // defaultExpanded
                        >
                            <AccordionSummary
                                className='right-panel-over-accordian-summary'
                                expandIcon={<ExpandMoreIcon style={{ color: "unset" }} />}
                                sx={{ px: 2 }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="h6" fontWeight="bold" color="text.secondary" className='accordian-text'>
                                        {team.teamName}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="text.secondary" className='accordian-text'>
                                        - Innings {innings}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                {/* Sort overs by over number descending */}
                                {groupedOvers[key]
                                    .sort((a, b) => {
                                        const overNumA = parseFloat(a[0].split('_##_')[2]);
                                        const overNumB = parseFloat(b[0].split('_##_')[2]);
                                        return overNumB - overNumA;
                                    })
                                    .map(([overKey, balls]) => {
                                        const [, , overNum] = overKey.split('_##_');
                                        const overDetails = getOverDetails(overNum, innings, teamId);
                                        const bowler = getPlayerDetails(overDetails?.bowlerId);

                                        return (
                                            <Accordion
                                                key={overKey}
                                                expanded={overExpanded.get(overKey) || false}
                                                onChange={handleOverChange(overKey)}
                                                sx={{
                                                    '&:before': { display: 'none' },
                                                    boxShadow: 'none',
                                                    '& .MuiAccordionSummary-root': {
                                                        borderBottom: '1px solid #f0f0f0',
                                                        minHeight: '48px',
                                                        backgroundColor: '#fafafa'
                                                    }
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon style={{ color: "unset", fontSize: '18px' }} />}
                                                    sx={{ px: 3, py: 1 }}
                                                >
                                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle2" fontWeight="bold" className='overHeadTextColor accordian-text'>
                                                                Over {Math.floor(parseFloat(overNum))}
                                                            </Typography>
                                                            {bowler?.playerimage ?
                                                                <PlayerImage
                                                                    // width="30px"
                                                                    playerImage={bowler?.playerimage}
                                                                    jerseyImage={jersy.jersey}
                                                                /> : <Avatar
                                                                    src="/api/placeholder/48/48"
                                                                    alt={bowler?.playerName || 'Bowler'}
                                                                    sx={{ width: 32, height: 32 }}
                                                                />
                                                            }
                                                            <Typography variant="subtitle2" fontWeight="bold" className='overHeadTextColor accordian-text'>{bowler?.playerName || 'Unknown Bowler'}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" className='overHeadTextColor accordian-text'>
                                                            {/* {`${overDetails?.totalRun || 0}/${overDetails?.totalWicket || 0}`} */}
                                                            <Typography variant="subtitle2" sx={{
                                                                fontFamily: "'Work Sans', sans-serif"
                                                            }} className='overHeadTextColor accordian-text'>
                                                                {`${overDetails?.totalRun || 0}/${overDetails?.totalWicket || 0} ${overDetails?.isComplete
                                                                    ? `[${overDetails?.teamScore}]`
                                                                    : `[${teamDetails?.[BATTING_TEAM]?.teamScore || 0}/${teamDetails?.[BATTING_TEAM]?.teamWicket || 0}]`
                                                                    }`}
                                                            </Typography>
                                                        </Typography>
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0 }}>
                                                    {renderOver(balls, overKey, jersy)}
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>
            {editWicketId && <EditWicketDetails onClose={() => { setEditWicketId(undefined) }} ballId={editWicketId} playersList={playersList} />}
        </>
    );
};

export default OversAccordion;