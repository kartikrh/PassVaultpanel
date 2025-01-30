import React from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Col, Row } from "reactstrap";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import MultiRunnerMarket from "./MultiRunnerMarket";

const renderCategoryMarkets = (category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo) => {
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
    return (
        <>
            {Object.entries(categorisedData).map(([category, markets]) => (
                <Accordion open={openAccordions} toggle={toggleAccordion} key={category} className="market-category-accordian">
                    <AccordionItem>
                        <AccordionHeader className="market-category-header" targetId={category}>
                            <b>{category}</b>
                        </AccordionHeader>
                        <AccordionBody className="market-category-body" accordionId={category}>
                            {markets.length > 0 ? (
                                renderCategoryMarkets(category, markets, columns, teams, handleMultiRunnerUpdate, setIsLoading, commentaryInfo)
                            ) : (
                                <div className="m-4 text-center">No record found</div>
                            )}
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            ))}
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