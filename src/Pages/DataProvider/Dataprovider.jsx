import React, { useState, useEffect } from 'react';
import{Accordion, AccordionBody, AccordionItem, AccordionHeader, Table, Container, Row, Card, CardBody} from 'reactstrap'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    const [apiXkey, setApiXkey] = useState(null);
    const [apiURL, setApiURL] = useState(null);
    const loadInitData = useSelector((state) => state.loadInit.loadInitData);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const navigate = useNavigate();

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
            const dpApiXkey = loadInitData.find(config => config.key === 'DPAPIXKEY')?.value;
            const dpApiURL = loadInitData.find(config => config.key === 'DPAPIURL')?.value;
            setApiXkey(dpApiXkey);
            setApiURL(dpApiURL);
        }
    },[loadInitData]);

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
                    console.log('Failed to fetch data');
                }
            } catch (err) {
                console.log('Error fetching data: ' + err.message);
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
        sessionStorage.setItem("selectedMatch", JSON.stringify(match));
        navigate("/dataproviderMarkets");
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
                                <Accordion key={eventType} className='data-provider-outer-accordian' open={openEventTypes} toggle={toggleEventType}>
                                    <AccordionItem className="rounded-0">
                                    <AccordionHeader className='data-provider-outer-accordian-summary px-1' targetId={eventType}>
                                        <div className='d-flex align-items-center p-1 px-2'>
                                            <SportsCricketIcon sx={{ mr: 2 }} />
                                            <span style={{fontSize: '20px', fontWeight: 'bold'}}>{eventType}</span>
                                        </div>
                                    </AccordionHeader>
                                    <AccordionBody accordionId={eventType} className='data-provider-outer-accordian-body p-0'>
                                        {Object.entries(competitions).map(([competition, matches]) => (
                                            <Accordion key={competition} open={openCompetition} toggle={toggleCompetition} className='category-list py-0'>
                                                <AccordionItem className="rounded-0">
                                                <AccordionHeader targetId={competition} className='data-provider-outer-accordian-summary' expandIcon={<ExpandMoreIcon />}>
                                                    <span style={{fontSize: '14px'}} className='p-1'>{competition}</span>
                                                </AccordionHeader>
                                                <AccordionBody accordionId={competition} className='ps-3'>
                                                       <Table className='mb-0' responsive hover>
                                                            <tbody>
                                                                {matches.map((match) =>{
                                                                    return(<tr onClick={() => handleRowClick(match)} className="px-1 data-provider-table-row" style={{border: '1px solid gray' }}>
                                                                    <td className='p-0 ps-1 m-0'>
                                                                        <div className=''>{match.eventName} <span style={{color: getStatusColor(match.status)}}> {getStatusLabel(match.status)} </span> {convertDateUTCToLocal(match.eventDate, "index")}</div>
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
                        </CardBody>
                    </Card>
                </Row>
            </Container>
        </div>
        </>
    );
};

export default DataproviderPage;