import React from 'react';
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

const OverContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px 16px',
    borderBottom: '1px solid #eee',
    '&:last-child': { borderBottom: 'none' }
}));

const PlayerInfo = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    width: '20%',
    minWidth: '150px',
    gap: '8px'
}));

const BallsContainer = styled(Box)(() => ({
    width: '70%',
    padding: '0 8px'
}));

const RunsInfo = styled(Box)(() => ({
    width: '10%',
    minWidth: '60px',
    textAlign: 'right'
}));

const OversAccordion = ({ overBalls, teamDetails, overHistory, playersList, currentOver }) => {
    // Process and merge overHistory with currentOver at initialization
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
        console.log({ processedHistory })
        console.log({ overNum, innings, teamId })
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
                balltype={ballType}
                className={isBoundary ? 'boundary' : isWicket ? 'wicket' : ''}
            >
                {displayValue}
            </BallBox>
        );
    };

    const renderOver = (balls, overKey) => {
        const [innings, teamId, overNum] = overKey.split('_##_');
        const overDetails = getOverDetails(overNum, innings, teamId);
        console.log({ overDetails });

        const bowler = getBowlerDetails(overDetails?.bowlerId);

        const sortedBalls = [...balls].sort((a, b) => b.overCount - a.overCount);

        return (
            <OverContainer>
                <PlayerInfo>
                    <Avatar
                        src="/api/placeholder/48/48"
                        alt={bowler?.playerName || 'Bowler'}
                        sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {bowler?.playerName || 'Unknown Bowler'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
                    <Typography variant="subtitle2">
                        {overDetails?.totalRun || 0} <b>Runs</b>
                        {overDetails?.totalWicket > 0 && (
                            <>
                                <br />
                                {overDetails?.totalWicket} <b>Wk</b>
                            </>
                        )}
                    </Typography>


                </RunsInfo>
            </OverContainer>
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
                                <Typography fontWeight="bold">
                                    {team.teamName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Innings {innings}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            {groupedOvers[key].map(([overKey, balls]) => renderOver(balls, overKey))}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default OversAccordion;