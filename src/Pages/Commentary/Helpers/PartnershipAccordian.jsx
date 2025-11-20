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
import PlayerImage from '../../../components/Common/Reusables/PlayerImage';

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

    

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    // Sort keys to put current batting team first
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

    const sortedKeys = React.useMemo(() => {
        const keys = Object.keys(groupedOvers || {});
        if (!keys.length) return [];

        return keys.sort((a, b) => {
            const [inningsA, teamIdA] = a.split('_').map(Number);
            const [inningsB, teamIdB] = b.split('_').map(Number);

            if (currentOver) {
            const isCurrentA =
                inningsA === currentOver.currentInnings &&
                teamIdA === currentOver.teamId;
            const isCurrentB =
                inningsB === currentOver.currentInnings &&
                teamIdB === currentOver.teamId;

            // Move the current innings/team to the top
            if (isCurrentA && !isCurrentB) return -1;
            if (!isCurrentA && isCurrentB) return 1;
            }

            // Sort by innings DESCENDING (2 before 1)
            if (inningsA > inningsB) return -1;
            if (inningsA < inningsB) return 1;

            // Then by teamId ASCENDING within the same innings
            if (teamIdA < teamIdB) return -1;
            if (teamIdA > teamIdB) return 1;

            return 0;
        });
    }, [groupedOvers, currentOver]);
    const [expanded, setExpanded] = React.useState(sortedKeys[0]);

    const renderPartnerships = (key, partnershipsData, team) => {
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
            // console.log("No partnerships found for the given key.");
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

            // Getting players from playersList based on commentaryPlayerId
            const teamPlayerList = partnership.teamId == teamDetails.BATTING_TEAM?.teamId 
                ? playersList.BATTING_TEAM 
                : playersList.BOWLING_TEAM;
            
            let player1Data = null;
            let player2Data = null;
            
            if (teamPlayerList) {
                player1Data = teamPlayerList.find(p => 
                    p.commentaryPlayerId === partnership.batter1Id && 
                    p.currentInnings == partnership.currentInnings
                );
                player2Data = teamPlayerList.find(p => 
                    p.commentaryPlayerId === partnership.batter2Id && 
                    p.currentInnings == partnership.currentInnings
                );
            }

            // Determine display order based on batterOrder
            let displayPlayer1, displayPlayer2;
            
            if (player1Data && player2Data && 
                player1Data?.batterOrder != null && player2Data?.batterOrder != null) {
                if (player1Data.batterOrder <= player2Data.batterOrder) {
                    // Keep original order (player1 has smaller batterOrder)
                    displayPlayer1 = {
                        name: partnership?.batter1Name,
                        runs: partnership?.batter1Runs,
                        balls: partnership?.batter1Balls,
                        image: partnership?.player1image
                    };
                    displayPlayer2 = {
                        name: partnership?.batter2Name,
                        runs: partnership?.batter2Runs,
                        balls: partnership?.batter2Balls,
                        image: partnership?.player2image
                    };
                } else {
                    // Swap the order (player2 has smaller batterOrder)
                    displayPlayer1 = {
                        name: partnership?.batter2Name,
                        runs: partnership?.batter2Runs,
                        balls: partnership?.batter2Balls,
                        image: partnership?.player2image
                    };
                    displayPlayer2 = {
                        name: partnership?.batter1Name,
                        runs: partnership?.batter1Runs,
                        balls: partnership?.batter1Balls,
                        image: partnership?.player1image
                    };
                }
            } else {
                // original order if batterOrder is null or players not found
                displayPlayer1 = {
                    name: partnership?.batter1Name,
                    runs: partnership?.batter1Runs,
                    balls: partnership?.batter1Balls,
                    image: partnership?.player1image
                };
                displayPlayer2 = {
                    name: partnership?.batter2Name,
                    runs: partnership?.batter2Runs,
                    balls: partnership?.batter2Balls,
                    image: partnership?.player2image
                };
            }

            return (
                <div
                    key={`partnership-${index}`}
                    className={`mb-3 ${cardType}-card`}
                >
                    <div className={`${cardType}-card-header`}>
                        {partnershipPosition}{ordinalSuffix} Partnership
                    </div>
                    <div className={`${cardType}-card-body`}>
                        <div className={`${cardType}-card-player-section left-player d-flex gap-2`}>
                            <div className='d-flex justify-content-center align-items-center'>
                                <PlayerImage
                                    // width="30px"
                                    playerImage={displayPlayer1.image}
                                    jerseyImage={team.jersey}
                                    width={cardType === 'first' ? "50px" : "30px"}
                                />
                            </div>
                            <div className="player-details">
                                <div className={`${cardType}-player-name`}>
                                    {displayPlayer1.name}
                                </div>
                                <div className={`${cardType}-player-stats partnershipTextColor`}>
                                    {displayPlayer1.runs || 0} ({displayPlayer1.balls || 0})
                                </div>
                            </div>
                        </div>
                        <div className={`${cardType}-partnership-stats partnershipTextColor`}>
                            <div className={`${cardType}-total-runs`}>
                                {partnership.totalRuns}
                                <span className="partnershipTextColor small fs-6 fw-normal">
                                    ({partnership.totalBalls})
                                </span>
                            </div>
                            <div className={`${cardType}-total-balls partnershipTextColor`}>
                                {partnership.totalFour} 4s {partnership.totalSix} 6s
                            </div>
                            <div className={`${cardType}-partnership-extras partnershipTextColor`}>
                                Extras: {partnership.extras || 0}
                            </div>
                        </div>
                        <div className={`right-player ${cardType}-card-player-section d-flex gap-2`}>
                            <div className='d-flex justify-content-center align-items-center'>
                                <PlayerImage
                                    // width="30px"
                                    width={cardType === 'first' ? "50px" : "30px"}
                                    playerImage={displayPlayer2.image}
                                    jerseyImage={team.jersey}
                                />
                            </div>
                            <div>
                                <div className={`${cardType}-player-name`}>
                                    {displayPlayer2.name}
                                </div>
                                <div className={`${cardType}-player-stats partnershipTextColor`}>
                                    {displayPlayer2.runs || 0} ({displayPlayer2.balls || 0})
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
                const team = teamId === teamDetails.BATTING_TEAM?.teamId.toString()
                    ? teamDetails.BATTING_TEAM
                    : teamDetails.BOWLING_TEAM;
                return (
                    <Accordion
                        // defaultExpanded
                        key={key}
                        expanded={sortedKeys.length > 1 ? expanded === key : expanded}
                        onChange={handleChange(key)}
                        sx={{
                            '&:before': { display: 'none' },
                            boxShadow: 'none',
                            '& .MuiAccordionSummary-root': {
                                borderBottom: '1px solid #eee'
                            }
                        }}
                        className='right-panel-over-accordian'
                    >
                        <AccordionSummary
                        className='right-panel-over-accordian-summary'
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ px: 2 }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                {/* <Typography fontWeight="bold" sx={{
                                    fontFamily: "'Work Sans', sans-serif",
                                }}>
                                    {team.teamName}
                                </Typography> */}
                                <Typography variant="h6" color="text.secondary" sx={{
                                    fontFamily: "'Work Sans', sans-serif"
                                }} className='accordian-text'>
                                    {team.teamName}
                                </Typography>
                                <Typography variant="h6"  color="text.secondary" sx={{
                                    fontFamily: "'Work Sans', sans-serif"
                                }} className='accordian-text'>
                                     - Innings {innings}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }} >
                            {renderPartnerships(key, partnerships, team)}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default PartnershipAccordian;