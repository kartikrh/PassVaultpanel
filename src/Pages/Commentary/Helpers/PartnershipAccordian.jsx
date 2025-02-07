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
import _ from 'lodash';

const PartnershipAccordian = ({ partnerships, overBalls, teamDetails, overHistory, playersList, currentOver }) => {
    // const processedHistory = React.useMemo(() => {
    //     if (!overHistory?.length) return [];

    //     // Sort by overId in descending order
    //     const sortedHistory = _.orderBy(overHistory, ['overId'], ['desc']);

    //     if (!currentOver) return sortedHistory;

    //     // Remove the last over if it matches currentOver
    //     const latestHistoryOver = sortedHistory[0];
    //     if (latestHistoryOver &&
    //         latestHistoryOver.over === currentOver.over &&
    //         latestHistoryOver.currentInnings === currentOver.currentInnings &&
    //         latestHistoryOver.teamId === currentOver.teamId) {
    //         return [currentOver, ...sortedHistory.slice(1)];
    //     }

    //     return sortedHistory;
    // }, [overHistory, currentOver]);

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

    const renderPartnerships = (key, partnershipsData) => {
        if (!key || !partnershipsData) {
            console.error("Invalid input: key or partnershipsData is missing.");
            return null;
        }

        const [currentInnings, teamId] = key.split('_');

        // Filter partnerships based on innings and teamId
        const filteredPartnerships = partnershipsData.filter((partnership) => {
            return (
                partnership.currentInnings == currentInnings &&
                partnership.teamId == teamId
            );
        });

        if (!filteredPartnerships.length) {
            console.log("No partnerships found for the given key.");
            return null;
        }

        return filteredPartnerships.map((partnership, index) => {
            const isFirstCard = index === 0;
            const cardType = isFirstCard ? 'first' : 'remaining';
            const partnershipPosition = partnership.order;
            const ordinalSuffix =
                partnershipPosition === 1 ? 'st' :
                    partnershipPosition === 2 ? 'nd' :
                        partnershipPosition === 3 ? 'rd' :
                            'th';

            return (
                <div
                    key={`partnership-${index}`}
                    className={`mb-3 ${cardType}-card`}
                >
                    <div className={`${cardType}-card-header`}>
                        {partnershipPosition}{ordinalSuffix} Partnership
                    </div>
                    <div className={`${cardType}-card-body`}>
                        <div className={`${cardType}-card-player-section left-player`}>
                            <img
                                src={partnership.player1image}
                                alt={partnership.batter1Name}
                                className={`${cardType}-player-image`}
                                onError={(e) => e.target.src = 'icons/default-player.png'}
                            />
                            <div className="player-details">
                                <div className={`${cardType}-player-name`}>
                                    {partnership.batter1Name}
                                </div>
                                <div className={`${cardType}-player-stats`}>
                                    {partnership.batter1Runs || 0} ({partnership.batter1Balls || 0})
                                </div>
                            </div>
                        </div>
                        <div className={`${cardType}-partnership-stats`}>
                            <div className={`${cardType}-total-runs`}>
                                {partnership.totalRuns}
                                <span className="text-secondary small fs-6 fw-normal">
                                    ({partnership.totalBalls})
                                </span>
                            </div>
                            <div className={`${cardType}-total-balls`}>
                                {partnership.totalFour} 4s {partnership.totalSix} 6s
                            </div>
                            <div className={`${cardType}-partnership-extras`}>
                                Extras: {partnership.extras || 0}
                            </div>
                        </div>
                        <div className={`right-player ${cardType}-card-player-section`}>
                            <img
                                src={partnership.player2image}
                                alt={partnership.batter2Name}
                                className={`${cardType}-player-image`}
                                onError={(e) => e.target.src = 'icons/default-player.png'}
                            />
                            <div>
                                <div className={`${cardType}-player-name`}>
                                    {partnership.batter2Name}
                                </div>
                                <div className={`${cardType}-player-stats`}>
                                    {partnership.batter2Runs || 0} ({partnership.batter2Balls || 0})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            {sortedKeys.map(key => {
                const [innings, teamId] = key.split('_');
                const team = teamId === teamDetails.BATTING_TEAM.teamId.toString()
                    ? teamDetails.BATTING_TEAM
                    : teamDetails.BOWLING_TEAM;
                return (
                    <Accordion
                        defaultExpanded={team.teamStatus == 1}
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
                                    fontFamily: "'Work Sans', sans-serif"
                                }}>
                                    Innings {innings}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }} >
                            {renderPartnerships(key, partnerships)}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default PartnershipAccordian;