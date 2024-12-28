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
import _ from 'lodash';

// Styled components remain the same
const BallBox = styled(Box)(({ theme, balltype }) => ({
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 2px',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '12px',
    backgroundColor:
        balltype === 'wicket' ? '#dc3545' :
            balltype === 'boundary' ? '#28a745' :
                balltype === 'extra' ? '#ffc107' :
                    '#f8f9fa',
    '&.boundary': { color: '#fff' },
    '&.wicket': { color: '#fff' }
}));

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


const OversAccordion = ({ overBalls, teamDetails, overHistory, playersList, currentOver }) => {
    // const viewportWidth = window.innerWidth;
    const [viewportWidth, setViewportWidth] = useState();
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
    const defaultExpandedKey = React.useMemo(() => {
        if (!currentOver) return null;
        return `${currentOver.currentInnings}_${currentOver.teamId}`;
    }, [currentOver]);

    const [expanded, setExpanded] = React.useState(defaultExpandedKey);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const getBowlerDetails = (bowlerId) => {
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

    const renderBall = (ball) => {
        const isWicket = ball.isWicket;
        const isBoundary = ball.isBoundary;
        const isExtra = ball.type !== 1;

        let ballType = 'normal';
        if (isWicket) ballType = 'wicket';
        else if (isBoundary) ballType = 'boundary';
        else if (isExtra) ballType = 'extra';

        let displayValue = ball.value;
        if (isWicket) displayValue = 'W';
        if (isExtra && ball.type === 2) displayValue = 'WB';
        if (isExtra && ball.type === 3) displayValue = 'NB';

        return (
            <BallBox
                sx={{
                    fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                }}
                balltype={ballType}
                className={isBoundary ? 'boundary' : isWicket ? 'wicket' : ''}
            >
                {displayValue}
            </BallBox>
        );
    };

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

    const renderOver = (balls, overKey) => {
        const [innings, teamId, overNum] = overKey.split('_##_');
        const overDetails = getOverDetails(overNum, innings, teamId);

        const bowler = getBowlerDetails(overDetails?.bowlerId);

        const sortedBalls = [...balls].sort((a, b) => b.overCount - a.overCount);
        // const viewportWidth = window.innerWidth;
        return (<>
            {viewportWidth < 578 ?
                <OverContainer>
                    <div className="d-flex justify-content-between w-100 px-0">
                        <PlayerInfo>
                            <Avatar
                                src="/api/placeholder/48/48"
                                alt={bowler?.playerName || 'Bowler'}
                                sx={{ width: 32, height: 32 }}
                            />
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{
                                    fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                                }}>
                                    {bowler?.playerName || 'Unknown Bowler'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{
                                    fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                                }}>
                                    Over {Math.floor(parseFloat(overNum))}
                                </Typography>
                            </Box>
                        </PlayerInfo>
                        <RunsInfo>
                            <Typography variant="subtitle2" sx={{
                                fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                            }}>
                                {overDetails?.totalRun || 0} <b>Runs</b>
                                {overDetails?.totalWicket > 0 && (
                                    <>
                                        <br />
                                        {overDetails?.totalWicket} <b>Wk</b>
                                    </>
                                )}
                            </Typography>
                        </RunsInfo>
                    </div>
                    <BallsContainer>
                        <Box display="flex" flexWrap="wrap" gap={0.5} >
                            {sortedBalls.map((ball, idx) => (
                                <React.Fragment key={idx}>
                                    {renderBall(ball)}
                                </React.Fragment>
                            ))}
                        </Box>
                    </BallsContainer>
                </OverContainer>
                : <OverContainer>
                    <PlayerInfo>
                        <Avatar
                            src="/api/placeholder/48/48"
                            alt={bowler?.playerName || 'Bowler'}
                            sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{
                                fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                            }}>
                                {bowler?.playerName || 'Unknown Bowler'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{
                                fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                            }}>
                                Over {Math.floor(parseFloat(overNum))}
                            </Typography>
                        </Box>
                    </PlayerInfo>
                    <BallsContainer>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {sortedBalls.map((ball, idx) => (
                                <React.Fragment key={idx}>
                                    {renderBall(ball)}
                                </React.Fragment>
                            ))}
                        </Box>
                    </BallsContainer>
                    <RunsInfo>
                        <Typography variant="subtitle2" sx={{
                            fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                        }}>
                            {overDetails?.totalRun || 0} <b>Runs</b>
                            {overDetails?.totalWicket > 0 && (
                                <>
                                    <br />
                                    {overDetails?.totalWicket} <b>Wk</b>
                                </>
                            )}
                        </Typography>
                    </RunsInfo>
                </OverContainer>}
        </>
        );
    };

    // Sort keys to put current batting team first
    const sortedKeys = Object.keys(groupedOvers).sort((a, b) => {
        const [inningsA, teamIdA] = a.split('_');
        const [inningsB, teamIdB] = b.split('_');

        if (currentOver) {
            const isCurrentA = inningsA === currentOver.currentInnings.toString() &&
                teamIdA === currentOver.teamId.toString();
            const isCurrentB = inningsB === currentOver.currentInnings.toString() &&
                teamIdB === currentOver.teamId.toString();

            if (isCurrentA) return 1;
            if (isCurrentB) return -1;
        }

        return b.localeCompare(a);
    });

    return (
        <Box sx={{ width: '100%' }}>
            {sortedKeys.map(key => {
                const [innings, teamId] = key.split('_');
                const team = teamId === teamDetails.BATTING_TEAM.teamId.toString()
                    ? teamDetails.BATTING_TEAM
                    : teamDetails.BOWLING_TEAM;

                return (
                    <Accordion
                        key={key}
                        expanded={expanded === key}
                        onChange={handleChange(key)}
                        sx={{
                            '&:before': { display: 'none' },
                            boxShadow: 'none',
                            '& .MuiAccordionSummary-root': {
                                borderBottom: '1px solid #eee'
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ px: 2 }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight="bold" sx={{
                                    fontFamily: "'Work Sans', sans-serif", color: '#505d69'
                                }}>
                                    {team.teamName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontFamily: "'Work Sans', sans-serif",
                                }}>
                                    Innings {innings}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }} >
                            {groupedOvers[key].map(([overKey, balls]) => renderOver(balls, overKey))}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default OversAccordion;