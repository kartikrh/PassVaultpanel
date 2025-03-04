import React, { useState, useEffect } from 'react';
import {
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Chip,
    Container,
    Paper,
    CircularProgress,
    // Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    // Accordion
} from '@mui/material';
import{Accordion, AccordionBody, AccordionItem, AccordionHeader, Table} from 'reactstrap'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import axiosInstance from '../../Features/axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR } from '../../components/Common/Const';
import EventDetails from './EventDetails';
import { convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import { fetchConfig } from '../Commentary/functions';

const DataproviderPage = () => {
    const loadInit = useSelector((state) => state.loadInit.loadInitData);
    const [events, setEvents] = useState([]);
    const [groupedEvents, setGroupedEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [socketUrl, setSocketUrl] = useState(null);
    const [apiXkey, setApiXkey] = useState(null);
    const [apiURL, setApiURL] = useState(null);
    const dispatch = useDispatch();

    const [openEventTypes, setEventTypes] = useState([]);
    const [openCompetition, setOpenCompetition] = useState([]);

    const toggleEventType = (id) => {
        setEventTypes((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      };
    
      // Function to toggle Category Accordion
      const toggleCompetition = (id) => {
        setOpenCompetition((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      };

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
    // useEffect(() => {
    //     const data = fetchConfig(loadInit)
    //     setApiURL(data.dpApiURL)
    //     setApiXkey(data.dpApiXkey)
    //     setSocketUrl(data.dpSocketUrl)
    // }, [])
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

            {Object.entries(groupedEvents).map(([eventType, competitions]) => (
                <Accordion key={eventType} className='data-provider-outer-accordian' open={openEventTypes} toggle={toggleEventType}>
                    {/* targetId={categoryId} */}
                    <AccordionItem >
                    <AccordionHeader className='data-provider-outer-accordian-summary px-1' targetId={eventType}>
                        <div className='d-flex align-items-center p-1 px-2'>
                            <SportsCricketIcon sx={{ mr: 2 }} />
                            <span style={{fontSize: '20px', fontWeight: 'bold'}}>{eventType}</span>
                        </div>
                    </AccordionHeader>
                    <AccordionBody accordionId={eventType} style={{padding: '0px'}} className='data-provider-outer-accordian-body'>
                        {Object.entries(competitions).map(([competition, matches]) => (
                            <Accordion key={competition} open={openCompetition} toggle={toggleCompetition} className='px-2 py-0'>
                                <AccordionItem>
                                <AccordionHeader targetId={competition} className='data-provider-outer-accordian-summary' expandIcon={<ExpandMoreIcon />}>
                                    <span style={{fontSize: '14px'}} className='p-1'>{competition}</span>
                                </AccordionHeader>
                                <AccordionBody accordionId={competition}>
                                    {/* <TableContainer component={Paper}>
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
                                              <TableCell sx={{ width: "300px"}}>{convertDateUTCToLocal(match.eventDate, "index")}</TableCell>
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
                                    </TableContainer> */}
                                    {/* <Table>
                                        {matches.map((match) =>{
                                            <tbody>
                                                <tr>
                                                    <td>
                                                    {`${match.eventName} ${getStatusLabel(match.status)} ${convertDateUTCToLocal(match.eventDate, "index")}`}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        })}
                                    </Table> */}
                                    <Table className='mb-0' responsive hover>
                                            <tbody>
                                                {matches.map((match) =>{
                                                    return(<tr onClick={() => handleRowClick(match)} className="px-1 mx-2 data-provider-table-row" style={{border: '1px solid gray' }}>
                                                    <td className='p-0 m-0'>
                                                        <div className='ms-4'>{match.eventName} <span style={{color: getStatusColor(match.status)}}> {getStatusLabel(match.status)} </span> {convertDateUTCToLocal(match.eventDate, "index")}</div>
                                                    </td>
                                                    </tr>)
                                                })}
                                            </tbody>
                                        </Table>
                                </AccordionBody>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))}
        </Container>
    );
};

export default DataproviderPage;