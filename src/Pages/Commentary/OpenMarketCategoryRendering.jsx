import React, { useEffect, useState } from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Col, Row } from "reactstrap";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import MultiRunnerMarket from "./MultiRunnerMarket";

const renderCategoryMarkets = (category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleAction) => {
    const singleRunnerMarkets = markets.filter(market => !market.runner || market.runner.length <= 1);
    const multiRunnerMarkets = markets.filter(market => market.runner && market.runner.length > 1);
    const getVisibleColumns = (isSingleRunner) => {
        return columns.filter(col => {
            if (col.hidden) {
                // For predefinedValue column, only show for single runner markets
                return isSingleRunner;
            }
            return true;
        });
    };
    return (
        <>
            {singleRunnerMarkets.length > 0 && (
                <ListingElement
                    columns={getVisibleColumns(true)}
                    dataSource={singleRunnerMarkets.map(market => {
                        const firstRunner = market?.runner && market.runner?.length > 0 ? market.runner[0] : undefined;
                        return {
                            ...market,
                            isSendData: market?.isSendData,
                            rateDiff: market?.rateDiff,
                            backPrice: firstRunner?.backPrice,
                            backSize: firstRunner?.backSize,
                            layPrice: firstRunner?.layPrice,
                            laySize: firstRunner?.laySize,
                            line: firstRunner?.line,
                            overRate: firstRunner?.overRate,
                            runnerId: firstRunner?.runnerId,
                            runnerName: firstRunner?.runnerName,
                            status: market?.status,
                            underRate: firstRunner?.underRate,
                            // ...(market.runner && market.runner[0]),
                        }
                    })}
                    tableElement={{ title: `Open Market - ${commentaryInfo?.en} [${commentaryInfo?.eid}]`, displayTitle: true }}
                    // tableElement={{ title: `${category} - Single Runner Markets`, displayTitle: true }}
                    tableClassName="open-market-table-class"
                    onSwitch={handleAction}
                />
            )}
            {multiRunnerMarkets.length > 0 && (
                <div className='overflow-scroll'>
                    {multiRunnerMarkets.map(market => (
                        <MultiRunnerMarket
                            key={market.marketId}
                            market={market}
                            onUpdate={handleMultiRunnerUpdate}
                            teams={teams}
                            loadingTrue={() => setIsLoading(true)}
                            loadingFalse={() => setIsLoading(false)}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const OpenMarketCategories = ({ categorisedData, columns, teams, handleMultiRunnerUpdate, setIsLoading, openAccordions, toggleAccordion, commentaryInfo }) => {
    const [deactivatedMarkets, setDeactivatedMarkets] = useState([]);
    const [activeMarkets, setActiveMarkets] = useState({});
    const [deactivatedAccordions, setDeactivatedAccordions] = useState([]);
    
    useEffect(() => {     
        if (Object.keys(categorisedData).length > 0) {
            const initialActiveMarkets = {};
            Object.entries(categorisedData).forEach(([category, markets]) => {
                initialActiveMarkets[category] = [...markets];
            });
            setActiveMarkets(initialActiveMarkets);
        }
    }, [categorisedData]);

    const handleDeactivate = (marketId) => {
        // Find the category this market belongs to and the market itself
        let marketToDeactivate = null;
        let marketCategory = null;
        
        // Look through our active markets to find the one to deactivate
        Object.entries(activeMarkets).forEach(([category, markets]) => {
            const market = markets.find(m => m.marketId == marketId);
            if (market) {
                marketToDeactivate = market;
                marketCategory = category;
            }
        });
        
        if (marketToDeactivate && marketCategory) {
            // Add to deactivated markets list with category info
            setDeactivatedMarkets(prevState => [
                ...prevState, 
                { ...marketToDeactivate, originalCategory: marketCategory }
            ]);
            
            // Remove from active markets
            setActiveMarkets(prevState => {
                const newActiveMarkets = { ...prevState };
                newActiveMarkets[marketCategory] = prevState[marketCategory].filter(
                    market => market.marketId != marketId
                );
                return newActiveMarkets;
            });
        }
    };

    const handleReactivate = (marketId) => {
        // Find the market to reactivate
        const marketToReactivate = deactivatedMarkets.find(market => market.marketId == marketId);
        
        if (marketToReactivate) {
            const category = marketToReactivate?.originalCategory;
            
            // Add back to active markets
            setActiveMarkets(prevState => {
                const newActiveMarkets = { ...prevState };
                // Make sure the category exists
                if (!newActiveMarkets[category]) {
                    newActiveMarkets[category] = [];
                }
                // Add the market back, removing the originalCategory property
                const { originalCategory, ...marketWithoutCategory } = marketToReactivate;
                newActiveMarkets[category] = [...newActiveMarkets[category], marketWithoutCategory];
                return newActiveMarkets;
            });
            
            // Remove from deactivated markets
            setDeactivatedMarkets(prevState => 
                prevState.filter(market => market.marketId != marketId)
            );
        }
    };

    const toggleDeactivatedAccordion = (id) => {
        if (deactivatedAccordions.includes(id)) {
            setDeactivatedAccordions(deactivatedAccordions.filter(item => item !== id));
        } else {
            setDeactivatedAccordions([...deactivatedAccordions, id]);
        }
    };
    
    // Group deactivated markets by their original category
    const groupedDeactivatedMarkets = deactivatedMarkets.reduce((acc, market) => {
        const category = market.originalCategory || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(market);
        return acc;
    }, {});
    return (
        <>
            {Object.entries(activeMarkets).map(([category, markets]) => (
                <Accordion open={openAccordions} toggle={toggleAccordion} key={category} className="market-category-accordian">
                    <AccordionItem className="rounded-0">
                        <AccordionHeader className="market-category-header" targetId={category}>
                            <b>{category}</b>
                        </AccordionHeader>
                        <AccordionBody className="market-category-body" accordionId={category}>
                            {markets.length > 0 ? (
                                renderCategoryMarkets(category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleDeactivate)
                            ) : (
                                <div className="m-4 text-center">No record found</div>
                            )}
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))}

            {deactivatedMarkets.length > 0 && (
            <div className='mt-3'>
            <h5 className='mb-0'>Deactive Markets</h5>
            {Object.entries(groupedDeactivatedMarkets).map(([category, markets]) => (
                <Accordion open={deactivatedAccordions} toggle={toggleDeactivatedAccordion} key={`deactivated-${category}`}  className="market-category-accordian">
                    <AccordionItem className="rounded-0">
                        <AccordionHeader className="market-category-header" targetId={`deactivated-${category}`}>
                            <b>{category}</b>
                        </AccordionHeader>
                        <AccordionBody className="market-category-body" accordionId={`deactivated-${category}`}>
                            {markets.length > 0 &&
                                renderCategoryMarkets(category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleReactivate)
                            }
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))}
            </div>
            )}

            <Row>
                <Col>
                    <b><i>Note :</i></b>
                    <div><b>RR</b> - Run Rate</div>
                    <div><b>A</b> - Active</div>
                    <div><b>B</b> - Allow</div>
                    <div><b>S</b> - Send</div>
                    <div><b>R-Diff</b> - Rate difference between No_Yes Rate</div>
                    <div><b>PR</b> - Predefine Value of Market</div>
                </Col>
            </Row>
        </>
    );
};

export default OpenMarketCategories;