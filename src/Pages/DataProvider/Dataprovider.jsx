import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Chip,
    Container,
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
import axiosInstance from '../../Features/axios';
import { useDispatch } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR } from '../../components/Common/Const';
import EventDetails from './EventDetails';
import { convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';

const DataproviderPage = () => {
    const [events, setEvents] = useState([]);
    const [groupedEvents, setGroupedEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [socketUrl, setSocketUrl] = useState(null);
    const [apiXkey, setApiXkey] = useState(null);
    const [apiURL, setApiURL] = useState(null);
    const dispatch = useDispatch();
    
    const fetchConfigAll = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/loadInitData", { isActive: true });
            const dpSocketUrl = response.result.find(config => config.key === 'DPSOCKETURL')?.value;
            const dpApiXkey = response.result.find(config => config.key === 'DPAPIXKEY')?.value;
            const dpApiURL = response.result.find(config => config.key === 'DPAPIURL')?.value;
            setSocketUrl(dpSocketUrl);
            setApiXkey(dpApiXkey);
            setApiURL(dpApiURL);
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigAll()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiURL}/api/eventList`,  {
                    method: "POST",
                    headers: {
                      "X-Key": apiXkey,
                    },
                });
                const data = await response.json();
                if (data.isSuccess && data.statusCode === 200) {
                    // Sort events by date
                    const sortedEvents = data.result.sort((a, b) =>
                        new Date(a.eventDate) - new Date(b.eventDate)
                    );
                    setEvents(sortedEvents);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError('Error fetching data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if(apiURL && apiXkey) {
          fetchData();
        }
    }, [apiURL, apiXkey]);

    const groupEvents = (eventsList) => {
        return eventsList.reduce((acc, event) => {
            const { eventType, competition } = event;
            if (!acc[eventType]) acc[eventType] = {};
            if (!acc[eventType][competition]) acc[eventType][competition] = [];
            acc[eventType][competition].push(event);
            return acc;
        }, {});
    };

    useEffect(() => {
        setGroupedEvents(groupEvents(events));
    }, [events]);

    const handleRowClick = (match) => {
        setSelectedMatch(match);
    };

    if (selectedMatch) {
        return <EventDetails event={selectedMatch} apiURL={apiURL} apiXkey={apiXkey} socketUrl={socketUrl} />;
    }

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

    const getStatusLabel = (status) => {
        switch (status) {
            case 1: return "Yet to Start";
            case 2: return "Toss Complete";
            case 3: return "In Progress";
            case 4: return "Finished";
            default: return "";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 1: return "grey";       // Yet to Start
            case 2: return "orange";     // Toss Complete
            case 3: return "darkgreen";  // In Progress
            case 4: return "darkred";    // Finished
            default: return "";
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 10 }}>
            <Typography variant="h6" gutterBottom>
                Cricket Betting Markets
            </Typography>

            {Object.entries(groupedEvents).map(([eventType, competitions]) => (
                <Accordion key={eventType}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SportsCricketIcon sx={{ mr: 2 }} />
                            <Typography variant="h6">{eventType}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {Object.entries(competitions).map(([competition, matches]) => (
                            <Accordion key={competition}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1">{competition}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer component={Paper}>
                                      <Table>
                                        <TableHead>
                                           <TableRow>
                                              <TableCell sx={{ width: "300px"}}><b>Date</b></TableCell>
                                              <TableCell sx={{ width: "500px"}}><b>Event</b></TableCell>
                                              <TableCell sx={{ width: "200px"}}><b>Status</b></TableCell>
                                           </TableRow>
                                        </TableHead>
                                        <TableBody>
                                           {matches.map((match) => (
                                           <TableRow 
                                              key={match.eventId} 
                                              hover 
                                              sx={{ cursor: "pointer" }} 
                                              onClick={() => handleRowClick(match)}
                                            >
                                              <TableCell sx={{ width: "300px"}}>{convertDateUTCToLocal(match.eventDate, "index")/* dayjs(match.eventDate).format('MMM D, YYYY - HH:mm') */}</TableCell>
                                              <TableCell sx={{ width: "500px"}}>{match.eventName}</TableCell>
                                              <TableCell sx={{ width: "200px"}}>
                                                <Chip
                                                    label={getStatusLabel(match.status)}
                                                    sx={{
                                                      backgroundColor: getStatusColor(match.status),
                                                      color: "white",
                                                      fontWeight: "bold",
                                                    }}
                                                />
                                              </TableCell>
                                           </TableRow>
                                           ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
};

export default DataproviderPage;