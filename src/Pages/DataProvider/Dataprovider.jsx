import React, { useState, useEffect } from 'react';
import{Accordion, AccordionBody, AccordionItem, AccordionHeader, Table, Container, Row, Card, CardBody} from 'reactstrap'
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { useSelector } from 'react-redux';
import { checkPermission, convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from 'react-router-dom';
import { TAB_DATA_PROVIDER, PERMISSION_VIEW } from '../../components/Common/Const';
import { isEmpty } from 'lodash';

const DataproviderPage = () => {
    const pageName = TAB_DATA_PROVIDER;
    const [events, setEvents] = useState([]);
    const [groupedEvents, setGroupedEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [apiConfig, setApiConfig] = useState({
        apiXkey: null,
        apiURL: null
    });
    const loadInitData = useSelector((state) => state.loadInit.loadInitData);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const navigate = useNavigate();
    document.title = "Trader";

    const [openEventTypes, setEventTypes] = useState([]);
    const [openCompetition, setOpenCompetition] = useState([]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
          navigate("/dashboard");
        }
      }, [permissionObj]);

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

    useEffect(() => {
        if(loadInitData) {
            setApiConfig({
                apiXkey: loadInitData.find((config) => config.key === "DPAPIXKEY")?.value,
                apiURL: loadInitData.find((config) => config.key === "DPAPIURL")?.value
            });
        }
    },[loadInitData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiConfig.apiURL}/api/eventList`,  {
                    method: "POST",
                    headers: {
                      "X-Key": apiConfig.apiXkey,
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
                    console.log('Failed to fetch data');
                }
            } catch (err) {
                console.log('Error fetching data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if(apiConfig.apiURL && apiConfig.apiXkey) {
          fetchData();
        }
    }, [apiConfig.apiURL, apiConfig.apiXkey]);

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

    useEffect(() => {
        if (Object.keys(groupedEvents).length > 0) {
            setEventTypes(Object.keys(groupedEvents));
        }
    }, [groupedEvents]);

    const handleRowClick = (details) => {
        const url = new URL(window.location.origin + "/dataproviderMarkets");
        sessionStorage.setItem('dataproviderEventId', "" + details?.eventId);
        sessionStorage.setItem('dataproviderEventDetails', "" + JSON.stringify(details));
        window.open(url.href, '_blank');
        sessionStorage.removeItem("dataproviderEventId");
        sessionStorage.removeItem("dataproviderEventDetails");
    };

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
        <>
        <div className="page-content">
            <Container fluid={true}>
                <Row>
                    <Card className='p-0'>
                        <CardBody className='p-3'>
                            {loading && <SpinnerModel />}
                            {Object.entries(groupedEvents).map(([eventType, competitions]) => (
                                <Accordion key={eventType} open={openEventTypes} toggle={toggleEventType}>
                                    <AccordionItem className="rounded-0">
                                    <AccordionHeader className='market-category-header' targetId={eventType}>
                                        <SportsCricketIcon sx={{ mr: 2 }} />
                                        <b>{eventType}</b>
                                    </AccordionHeader>
                                    <AccordionBody accordionId={eventType} className='market-category-body category-list'>
                                        {Object.entries(competitions).map(([competition, matches]) => (
                                            <Accordion key={competition} open={openCompetition} toggle={toggleCompetition}>
                                                <AccordionItem className="rounded-0">
                                                <AccordionHeader targetId={competition} className='market-category-header'>
                                                    {competition}
                                                </AccordionHeader>
                                                <AccordionBody accordionId={competition} className="market-category-body">
                                                       <Table className='mb-0' responsive hover>
                                                            <tbody>
                                                                {matches.map((match) =>{
                                                                  return (
                                                                    <tr onClick={() => handleRowClick(match)} className='cursor-pointer'>
                                                                      <td className='event-col p-2'>
                                                                        <b>{match.eventName} ({match.eventId})</b>
                                                                      </td>
                                                                      <td className='date-width p-2'>
                                                                        {match?.marketCount} total market
                                                                      </td>
                                                                      <td className='date-width p-2'>
                                                                        {match?.openMarketCount} open market
                                                                      </td>
                                                                      <td className='date-width p-2'>
                                                                        {convertDateUTCToLocal(match?.eventDate, "index")}
                                                                      </td>
                                                                      <td className='status-width p-2'>
                                                                        <span className="event-status" style={{backgroundColor: getStatusColor(match.status)}}> 
                                                                            {getStatusLabel(match?.status)}
                                                                        </span>
                                                                      </td>
                                                                    </tr>
                                                                  )
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
                        </CardBody>
                    </Card>
                </Row>
            </Container>
        </div>
        </>
    );
};

export default DataproviderPage;