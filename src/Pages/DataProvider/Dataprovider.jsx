import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Card,
    CardContent,
    Box,
    Chip,
    Divider,
    Container,
    Grid,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import CategoryIcon from '@mui/icons-material/Category';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import dayjs from 'dayjs';

// Fallback constants if API doesn't provide categories
const MARKET_CATEGORY_CONST = [
    { marketTypeCategoryId: 5, categoryName: "Market", displayOrder: 1 },
    { marketTypeCategoryId: 6, categoryName: "Win Toss", displayOrder: 2 },
    { marketTypeCategoryId: 7, categoryName: "Bookmakers", displayOrder: 3 },
    { marketTypeCategoryId: 8, categoryName: "ManualOdds", displayOrder: 4 },
    { marketTypeCategoryId: 9, categoryName: "Adv Fancy", displayOrder: 5 },
    { marketTypeCategoryId: 36, categoryName: "TOTALEVENTRUN", displayOrder: 6 },
    { marketTypeCategoryId: 23, categoryName: "Session", displayOrder: 7 },
    { marketTypeCategoryId: 10, categoryName: "Over Session", displayOrder: 8 },
    { marketTypeCategoryId: 11, categoryName: "Only Over", displayOrder: 9 },
    { marketTypeCategoryId: 12, categoryName: "Player", displayOrder: 10 },
    { marketTypeCategoryId: 29, categoryName: "Player Boundaries", displayOrder: 11 },
    { marketTypeCategoryId: 30, categoryName: "Player Balls Faced", displayOrder: 12 },
    { marketTypeCategoryId: 14, categoryName: "Bowler Session", displayOrder: 13 },
    { marketTypeCategoryId: 32, categoryName: "Partnership boundaries", displayOrder: 14 },
    { marketTypeCategoryId: 13, categoryName: "Wicket", displayOrder: 15 },
    { marketTypeCategoryId: 31, categoryName: "Fall of Wicket", displayOrder: 16 },
    { marketTypeCategoryId: 33, categoryName: "Wicket Lost Balls", displayOrder: 17 },
    { marketTypeCategoryId: 27, categoryName: "Only over L.D.O", displayOrder: 18 },
    { marketTypeCategoryId: 26, categoryName: "Fancy L.D.O", displayOrder: 19 },
    { marketTypeCategoryId: 28, categoryName: "Last Digit Number", displayOrder: 20 },
    { marketTypeCategoryId: 16, categoryName: "Tie", displayOrder: 21 },
    { marketTypeCategoryId: 18, categoryName: "OVER UNDER", displayOrder: 22 },
    { marketTypeCategoryId: 15, categoryName: "Premium ODDs", displayOrder: 23 },
    { marketTypeCategoryId: 17, categoryName: "LineMarket", displayOrder: 24 },
    { marketTypeCategoryId: 20, categoryName: "Player OODs", displayOrder: 26 },
    { marketTypeCategoryId: 21, categoryName: "Boundary OODs", displayOrder: 27 },
    { marketTypeCategoryId: 22, categoryName: "Other OODs", displayOrder: 28 },
    { marketTypeCategoryId: 24, categoryName: "Extra Odds", displayOrder: 29 },
    { marketTypeCategoryId: 25, categoryName: "Special ODDs", displayOrder: 30 },
    { marketTypeCategoryId: 35, categoryName: "ODDEVEN", displayOrder: 31 }
];

const MARKET_TYPES_CONST = [
    { marketTypeId: 1, marketTypeName: "Market", displayOrder: 1 },
    { marketTypeId: 3, marketTypeName: "Bookmakers", displayOrder: 2 },
    { marketTypeId: 5, marketTypeName: "ManualOdds", displayOrder: 3 },
    { marketTypeId: 2, marketTypeName: "Fancy", displayOrder: 4 },
    { marketTypeId: 4, marketTypeName: "LineMarket", displayOrder: 5 },
    { marketTypeId: 6, marketTypeName: "MeterPari", displayOrder: 6 },
    { marketTypeId: 7, marketTypeName: "Sportbook", displayOrder: 7 }
];

const DataproviderPage = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [marketTypes, setMarketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedEvents, setExpandedEvents] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://prediction.deployed.live/api/getopenEvents');
                const data = await response.json();

                if (data.isSuccess && data.statusCode === 200) {
                    // Sort events by date
                    const sortedEvents = data.result.sort((a, b) =>
                        new Date(a.eventDate) - new Date(b.eventDate)
                    );
                    setEvents(sortedEvents);

                    // Use API categories if available, otherwise use constants
                    if (data.categories && data.categories.length > 0) {
                        setCategories(data.categories);
                    } else {
                        setCategories(MARKET_CATEGORY_CONST);
                    }

                    // Use API market types if available, otherwise use constants
                    if (data.marketTypes && data.marketTypes.length > 0) {
                        setMarketTypes(data.marketTypes);
                    } else {
                        setMarketTypes(MARKET_TYPES_CONST);
                    }
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError('Error fetching data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleEventAccordion = (eventId) => {
        setExpandedEvents(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const toggleCategoryAccordion = (categoryKey) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryKey]: !prev[categoryKey]
        }));
    };

    const getCategoryNameById = (categoryId) => {
        const category = categories.find(cat => cat.marketTypeCategoryId === categoryId);
        return category ? category.categoryName : 'Unknown Category';
    };

    const getMarketTypeNameById = (marketTypeId) => {
        const marketType = marketTypes.find(type => type.marketTypeId === marketTypeId);
        return marketType ? marketType.marketTypeName : 'Unknown Type';
    };

    const parseMarketData = (marketDataStr) => {
        try {
            return JSON.parse(marketDataStr);
        } catch (e) {
            return null;
        }
    };

    // Group markets by category
    const getGroupedMarketsByCategory = (markets) => {
        const grouped = {};

        markets.forEach(market => {
            const categoryId = market.marketTypeCategory;
            if (!grouped[categoryId]) {
                grouped[categoryId] = [];
            }
            grouped[categoryId].push(market);
        });

        // Sort categories by display order
        return Object.keys(grouped)
            .map(categoryId => ({
                categoryId: parseInt(categoryId),
                markets: grouped[categoryId].sort((a, b) => a.marketId - b.marketId)
            }))
            .sort((a, b) => {
                const categoryA = categories.find(cat => cat.marketTypeCategoryId === a.categoryId);
                const categoryB = categories.find(cat => cat.marketTypeCategoryId === b.categoryId);
                return (categoryA?.displayOrder || 999) - (categoryB?.displayOrder || 999);
            });
    };

    // Render runner data from market data
    const renderRunnerData = (marketData) => {
        if (!marketData || !marketData.runner || !Array.isArray(marketData.runner)) {
            return <Typography color="error">No runner data available</Typography>;
        }

        return (
            <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Runner</TableCell>
                            <TableCell align="right">Line</TableCell>
                            <TableCell align="right">Back Price</TableCell>
                            <TableCell align="right">Lay Price</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {marketData.runner.map((runner, idx) => (
                            <TableRow key={runner.runnerId || idx}>
                                <TableCell component="th" scope="row">
                                    {runner.runner}
                                </TableCell>
                                <TableCell align="right">{runner.line}</TableCell>
                                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    {runner.backPrice}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                    {runner.layPrice}
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        size="small"
                                        label={runner.status === 1 ? "Active" : "Inactive"}
                                        color={runner.status === 1 ? "success" : "default"}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" variant="h5">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Cricket Betting Markets
            </Typography>

            {events.length === 0 ? (
                <Typography variant="body1">No events available</Typography>
            ) : (
                events.map(event => (
                    <Accordion
                        key={event.eventId}
                        expanded={expandedEvents[event.eventId] || false}
                        onChange={() => toggleEventAccordion(event.eventId)}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <SportsCricketIcon sx={{ mr: 2 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">{event.eventName}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        {dayjs(event.eventDate).format('MMM D, YYYY - HH:mm')} • {event.matchType} • {event.competition}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={event.status === 1 ? "LIVE" : "UPCOMING"}
                                    color={event.status === 1 ? "success" : "default"}
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 2 }}>
                            {event.markets.length === 0 ? (
                                <Typography variant="body2">No markets available for this event</Typography>
                            ) : (
                                getGroupedMarketsByCategory(event.markets).map(group => {
                                    const categoryKey = `${event.eventId}-${group.categoryId}`;
                                    return (
                                        <Accordion
                                            key={categoryKey}
                                            expanded={expandedCategories[categoryKey] || false}
                                            onChange={() => toggleCategoryAccordion(categoryKey)}
                                            sx={{ mb: 1 }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{ bgcolor: 'grey.100' }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CategoryIcon sx={{ mr: 1 }} />
                                                    <Typography variant="subtitle1">
                                                        {getCategoryNameById(group.categoryId)} ({group.markets.length})
                                                    </Typography>
                                                </Box>
                                            </AccordionSummary>

                                            <AccordionDetails>
                                                <Grid container spacing={2}>
                                                    {group.markets.map(market => {
                                                        const marketData = parseMarketData(market.data);
                                                        return (
                                                            <Grid item xs={12} key={market.marketId}>
                                                                <Card variant="outlined" sx={{ mb: 1 }}>
                                                                    <CardContent>
                                                                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Box>
                                                                                <Typography variant="h6" component="div">
                                                                                    {market.marketName}
                                                                                </Typography>
                                                                                <Typography color="text.secondary" variant="body2">
                                                                                    Market ID: {market.marketId} • Type: {getMarketTypeNameById(market.marketType)}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Chip
                                                                                icon={<ShowChartIcon />}
                                                                                label={market.status === 1 ? "Active" : "Inactive"}
                                                                                color={market.status === 1 ? "success" : "default"}
                                                                                variant="outlined"
                                                                            />
                                                                        </Box>

                                                                        <Divider sx={{ mb: 2 }} />

                                                                        {marketData ? (
                                                                            renderRunnerData(marketData)
                                                                        ) : (
                                                                            <Typography color="text.secondary" variant="body2">
                                                                                No market data available
                                                                            </Typography>
                                                                        )}

                                                                        {market.lastUpdate && (
                                                                            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                                                                Last updated: {dayjs(market.lastUpdate).format('MMM D, YYYY HH:mm:ss')}
                                                                            </Typography>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </Container>
    );
};

export default DataproviderPage;