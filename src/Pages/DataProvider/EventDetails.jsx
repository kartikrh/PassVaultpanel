import React, { useEffect, useState } from 'react';
import {
    Typography,
    Button,
    Box,
    Container,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR } from '../../components/Common/Const';

const EventDetails = ({event, apiURL, apiXkey, socketUrl}) => {
    const [eventInfo, setEventInfo] = useState([]); 
    const [marketsGrouped, setMarketsGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [marketTypes, setMarketTypes] = useState([]);
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);
    const dispatch = useDispatch();

    useEffect(()=>{
        const fetchMarketCategoriesList = async () =>{
            await axiosInstance
            .post("/admin/marketTemplate/mtAndCategories", {})
            .then((response) => {
                if(response?.result) {
                    setCategories(response.result?.categories || []);
                    setMarketTypes(response.result?.marketTypes || []);
                }
            })
            .catch((error) => {
              dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
          }
        fetchMarketCategoriesList()
    },[])

    const groupMarkets = (markets) => {
        const groupedData = {};

        // Sorting marketTypes & categories by displayOrder
        const sortedMarketTypes = [...marketTypes].sort((a, b) => a.displayOrder - b.displayOrder);
        const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

        sortedMarketTypes.forEach((type) => {
            const typeMarkets = markets.filter(market => market.marketType === type.marketTypeId);
            if (typeMarkets.length > 0) {
                groupedData[type.marketTypeId] = {
                    typeInfo: type,
                    categories: {}
                };

                sortedCategories.forEach((category) => {
                    if (category.marketTypeId === type.marketTypeId) {
                        const categoryMarkets = typeMarkets.filter(market => market.marketTypeCategory === category.marketTypeCategoryId);
                        if (categoryMarkets.length > 0) {
                            groupedData[type.marketTypeId].categories[category.marketTypeCategoryId] = {
                                categoryInfo: category,
                                markets: categoryMarkets
                            };
                        }
                    }
                });
            }
        });
        return groupedData;
    };
    
    useEffect(() => {
            const fetchData = async (eventId) => {
                try {
                    const response = await fetch(`${apiURL}/api/eventInfo`,  {
                        method: "POST",
                        headers: {
                          'Content-Type': 'application/json',
                          "X-Key": apiXkey,
                        },
                        body: JSON.stringify({ eventId })
                    });
                    const data = await response.json();
                    if (data.isSuccess && data.statusCode === 200) {
                        const filteredMarkets = data?.result?.markets.filter(market => ![4, 5, 6].includes(market?.status));
                        setEventInfo(filteredMarkets);
                    } else {
                        setError('Failed to fetch data');
                    }
                } catch (err) {
                    setError('Error fetching data: ' + err.message);
                } finally {
                    setLoading(false);
                }
            };
        if(apiURL && apiXkey && event?.eventId) {
          fetchData(event.eventId);
        }
    }, [apiURL, apiXkey, event?.eventId]);

    useEffect(()=>{
      if(eventInfo.length > 0 && marketTypes.length > 0 && categories.length > 0) {
        const data = groupMarkets(eventInfo);
        setMarketsGrouped(data);
      } 
    },[eventInfo, marketTypes, categories])
    
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
    <>
       <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box 
                sx={{ 
                    p: 2, 
                    border: "1px solid #ddd", 
                    borderRadius: 2, 
                    backgroundColor: "white", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    mt: 5
                }}
            >
                <Box>
                    <Typography variant="h6">
                        {event.eventName} [{convertDateUTCToLocal(event.eventDate, "index")}]
                    </Typography>
                    <Typography>{event.eventType} / {event.competition}</Typography>
                </Box>

                <Button
                    variant="contained"
                    color="success"
                    onClick={() => window.location.reload()}
                >
                    Back
                </Button>
            </Box>
            {Object.entries(marketsGrouped).map(([marketTypeId, typeData]) => (
                <Accordion key={marketTypeId} sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{typeData?.typeInfo?.displayName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className='p-2'>
                        {Object.entries(typeData?.categories).map(([categoryId, categoryData]) => {
                            const fancyLineMarkets = categoryData.markets.filter(market =>
                                    market.marketType == marketTypeObj?.Fancy || market.marketType == marketTypeObj?.LineMarket
                                );
                            const otherMarkets = categoryData.markets.filter(market =>
                                    market.marketType != marketTypeObj?.Fancy && market.marketType != marketTypeObj?.LineMarket
                                );
                            return (
                            <Accordion key={categoryId} sx={{ mt: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1">{categoryData?.categoryInfo?.displayName}</Typography>
                                </AccordionSummary>
                                <AccordionDetails className='p-2'>
                                    {fancyLineMarkets.length > 0 ? 
                                                <TableContainer component={Paper}>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ width: "800px"}} className='p-2'><b>Market</b></TableCell>
                                                                <TableCell sx={{ width: "100px"}} align="center" className='p-2'><b>Back</b></TableCell>
                                                                <TableCell sx={{ width: "100px"}} align="center" className='p-2'><b>Lay</b></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                        {fancyLineMarkets.map((market) => (
                                                                <TableRow key={market.marketId}>
                                                                    <TableCell sx={{ width: "800px"}}>{market?.marketName}</TableCell>
                                                                    <TableCell sx={{ width: "100px"}} align="center" className="yes-rate text-center py-0">
                                                                        <div className="rate-font">{market?.runner?.[0]?.backPrice || "0"}</div>
                                                                        <div className="point-font">{market?.runner?.[0]?.backSize || "0"}</div>
                                                                    </TableCell>
                                                                    <TableCell sx={{ width: "100px"}} align="center" className="no-rate text-center py-0">
                                                                        <div className="rate-font">{market?.runner?.[0]?.layPrice || "0"}</div>
                                                                        <div className="point-font">{market?.runner?.[0]?.laySize || "0"}</div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                    : null}
                                    {otherMarkets.length > 0 && otherMarkets.map((market) => (
                                        <>
                                            {market.runner && market.runner.length > 0 && (
                                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ width: "800px"}} className='p-2'><b>{market?.marketName}</b></TableCell>
                                                                <TableCell sx={{ width: "100px"}} align="center" className='p-2'><b>Back</b></TableCell>
                                                                <TableCell sx={{ width: "100px"}} align="center" className='p-2'><b>Lay</b></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {market.runner.map((runner) => (
                                                                <TableRow key={runner.runnerId}>
                                                                    <TableCell sx={{ width: "800px"}}>{runner.runner}</TableCell>
                                                                    <TableCell sx={{ width: "100px"}} align="center" className="yes-rate text-center py-0">
                                                                        <div className="rate-font">{runner?.backPrice || "0"}</div>
                                                                        <div className="point-font">{runner?.backSize || "0"}</div>
                                                                    </TableCell>
                                                                    <TableCell sx={{ width: "100px"}} align="center" className="no-rate text-center py-0">
                                                                        <div className="rate-font">{runner?.layPrice || "0"}</div>
                                                                        <div className="point-font">{runner?.laySize || "0"}</div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            )}
                                        </>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        )})}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    </>
  )
}

export default EventDetails