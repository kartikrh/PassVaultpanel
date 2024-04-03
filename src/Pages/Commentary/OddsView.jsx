import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ERROR } from "../../components/Common/Const";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import { ListingElement } from "../../components/Common/Reusables/ListingComponent";
import "./CommentaryCss.css"
import _, { isEmpty } from "lodash";
import { MARKET_STATUS } from "./CommentartConst";

const tableElement = {
    title: "oddsView",
    displayTitle: true
};

export const OddsView = () => {
    const [data, setData] = useState([]);
    const [commentaryInfo, setCommentaryInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    // const [autoInterval, setAutoInterval] = useState(500)
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const commentaryId = +localStorage.getItem('oddsViewCommentaryId') || "0";
    const intervalIdRef = useRef(null);

    const fetchTableData = async (commentaryId) => {
        // setIsLoading(true);
        await axiosInstance
            .post("/admin/eventMarket/marketListByCId", { commentaryId })
            .then((response) => {
                if (response?.result) {
                    const dataList = response?.result || []
                    let updatedDatalist = dataList.map(eventMarket => {
                        const marketRunner = eventMarket.marketRunners[0]
                        if (eventMarket.marketRunners)
                            return {
                                "fancy": eventMarket.marketName + " " + eventMarket.teamName,
                                "odds": {
                                    noRate: marketRunner.noRate,
                                    yesRate: marketRunner.yesRate,
                                    noPoint: marketRunner.noPoint,
                                    yesPoint: marketRunner.yesPoint
                                },
                                "status": MARKET_STATUS[eventMarket.status]
                            }
                        else return null
                    }).filter(x => x)
                    updatedDatalist = _.orderBy(updatedDatalist, ['fancy'], ['asc']);
                    setData(updatedDatalist);
                }
                // setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                // setIsLoading(false);
            });
    };

    const fetchCommentaryInfo = async () => {
        setIsLoading(true);
        await axiosInstance
            .post("/admin/commentary/getEventDetailsByCId", { commentaryId })
            .then((response) => {
                if (response?.result?.es) setCommentaryInfo(response?.result?.es)
                setIsLoading(false);
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsLoading(false);
            });
    }

    const handleBackClick = () => {
        navigate("/commentary");
    };

    const columns = [
        {
            title: "Fancy",
            dataIndex: "fancy",
            key: "fancy",
            style: { width: "35%" },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            style: { width: "10%" },
        },
        {
            title: "Odds",
            dataIndex: "odds",
            render: (text, record) => (
                <div className=" odds-container">
                    <div className="input-no-field odds-box">
                        <div>{text.noRate || "-"}</div>
                        <div>{`[${text.noPoint || "-"}]`}</div>
                    </div>
                    <div className="input-yes-field odds-box">
                        <div>{text.yesRate || "-"}</div>
                        <div>{`[${text.yesPoint || "-"}]`}</div>
                    </div>
                </div>
            ),
            columnClassName: "odds-column"
        },
    ];

    useEffect(() => {
        if (commentaryId !== "0") {
            fetchTableData(commentaryId);
            fetchCommentaryInfo(commentaryId)
        }
        const fetchConfigAll = async () => {
            setIsLoading(true);
            try {
                intervalIdRef.current = setInterval(() => {
                    if (commentaryId !== "0") {
                        fetchTableData(commentaryId);
                    }
                }, 1000);
            } catch (error) {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfigAll();
        return () => {
            clearInterval(intervalIdRef.current);
        };
    }, []);

    useEffect(() => {

    }, [])
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    <Col className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Odds View" page="updatecp" />
                                    </Col>
                                    <Col className="odds-page-header">
                                        <button className="btn btn-danger text-right" onClick={handleBackClick}>Back</button>
                                    </Col>
                                </Row>
                                <Row>
                                    <div className="odds-page-header">{!isEmpty(commentaryInfo) && commentaryInfo.en}</div>
                                </Row>
                                <Row>
                                    <Col>
                                        <ListingElement
                                            columns={columns}
                                            dataSource={data}
                                            tableElement={tableElement}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}
