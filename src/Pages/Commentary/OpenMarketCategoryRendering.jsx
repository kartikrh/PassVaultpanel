import React, { useEffect, useState } from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Col, Row } from "reactstrap";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import MultiRunnerMarket from "./MultiRunnerMarket";
import { PlayeraListingComponent } from '../../components/Common/Reusables/PlayeraListingComponent';
import { getStatusColor1 } from './CommentartConst';

function groupMarketsByPlayer(markets) {
    const grouped = {};
  
    markets.forEach(market => {
      const playerId = market.playerId;
  
      if (!grouped[playerId]) {
        grouped[playerId] = {
          playerId,
          markets: [market]
        };
      } else {
        grouped[playerId].markets.push(market);
      }
    });
    return Object.values(grouped);
}
   
const renderCategoryMarkets = (category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleAction, handleValueChange, handleSingleAction, players, playersMarketShow, updateRecordsFunc) => {
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
    let groupedMarkets = category?.toLowerCase() === "players"
    ? groupMarketsByPlayer(singleRunnerMarkets)
    : [];

    groupedMarkets = Object.values(groupedMarkets).map((group) => ({
        playerName: players?.[group.playerId] || "Unknown Player",
        markets: group.markets,
    }));
    return (
        <>
            {singleRunnerMarkets.length > 0 && category !== 'Players' && (
               
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
            {groupedMarkets.length > 0 && category === 'Players' && (
                <div className='bg-white'>
                    <div className='d-flex p-1 player-market'>
                                <div style={{ width: '20%' }} className="py-2"></div>
                                <div className="d-flex" style={{ width: '80%' }}>
                                {['Runs', 'Boundaries', 'Balls'].slice(0, 3).map((title, index) => (
                                    <div key={index} className="flex-33 player-market-title text-center fs-5 fw-semibold">
                                        {title}
                                    </div>
                                ))}
                                </div>
                            {/* </div> */}
                    </div>
                    <>
                    {groupedMarkets.map(group => (
                        <div className='d-flex p-1 player-market'>
                            <div style={{width: '20%'}}>
                                <div className='fs-5'>{group.playerName}</div>
                                <div className='fs-6 gap-2'><span className='pe-1'>{group?.markets[0]?.teamName}</span>|<span className='ps-1'>Innings - {group?.markets[0]?.inningsId}</span></div>
                            </div>
                            <div style={{width: '80%'}}>

                            <PlayeraListingComponent
                                backgroundColor={getStatusColor1(+group?.markets[0]?.status)}
                                key={group.playerName}
                                columns={getVisibleColumns(true)}
                                dataSource={group.markets.map(market => {
                                    const firstRunner = market.runner?.[0];
                                    return {
                                    ...market,
                                    backPrice: firstRunner?.backPrice,
                                    layPrice: firstRunner?.layPrice,
                                    runnerId: firstRunner?.runnerId,
                                    runnerName: firstRunner?.runnerName,
                                    line: firstRunner?.line,
                                    overRate: firstRunner?.overRate,
                                    underRate: firstRunner?.underRate,
                                    };
                                })}
                                tableElement={{ title: group.playerName, displayTitle: true }}
                                tableClassName="open-market-table-class"
                                onSwitch={handleAction}
                                handleValueChange={handleValueChange}
                                handleSingleAction={handleSingleAction}
                                updateRecordsFunc={updateRecordsFunc}
                            />
                            </div>
                        </div>
                    ))}
                    </>
                </div>
                )
            }

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

const OpenMarketCategories = ({ categorisedData, columns, teams, handleMultiRunnerUpdate, setIsLoading, openAccordions, toggleAccordion, commentaryInfo, handleValueChange, handleSingleAction, players, playersMarketShow, updateRecordsFunc }) => {
    const [deactivatedMarkets, setDeactivatedMarkets] = useState([]);
    const [activeMarkets, setActiveMarkets] = useState({});
    const [deactivatedAccordions, setDeactivatedAccordions] = useState([]);
    useEffect(() => {     
        if (Object.keys(categorisedData).length > 0) {
          if(deactivatedMarkets.length > 0) {
            const updatedDeactivatedMarkets = deactivatedMarkets.map((market) => {
                const updatedValues = Object.values(categorisedData).flat();
                const matchedData = updatedValues?.find(entry => entry.marketId == market.marketId);
                if (matchedData) {
                    return { ...market, ...matchedData };
                }
                return market;
            });
            setDeactivatedMarkets(updatedDeactivatedMarkets);
          }
            const initialActiveMarkets = {};
            Object.entries(categorisedData).forEach(([category, markets]) => {
                const activeMarketsForCategory = markets.filter(market => 
                    !deactivatedMarkets.some(deactivatedMarket => deactivatedMarket.marketId == market.marketId)
                );
                initialActiveMarkets[category] = [...activeMarketsForCategory];
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
                                renderCategoryMarkets(category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleDeactivate, handleValueChange, handleSingleAction, players, playersMarketShow ,updateRecordsFunc)
                            ) : (
                                <div className="m-4 text-center">No record found</div>
                            )}
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))}

            {deactivatedMarkets.length > 0 && (
            <> <h5 className='mb-0 mt-3'>Deactive Markets</h5>
            {Object.entries(groupedDeactivatedMarkets).map(([category, markets]) => (
                <Accordion open={deactivatedAccordions} toggle={toggleDeactivatedAccordion} key={`deactivated-${category}`}  className="market-category-accordian">
                    <AccordionItem className="rounded-0">
                        <AccordionHeader className="market-category-header" targetId={`deactivated-${category}`}>
                            <b>{category}</b>
                        </AccordionHeader>
                        <AccordionBody className="market-category-body" accordionId={`deactivated-${category}`}>
                            {markets.length > 0 &&
                                renderCategoryMarkets(category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo, handleReactivate, handleValueChange, handleSingleAction, players, playersMarketShow ,updateRecordsFunc)
                            }
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))} </>
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