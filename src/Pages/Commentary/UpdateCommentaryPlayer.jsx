import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { PERMISSION_VIEW, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, CardHeader, Container, Row, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";

const PlayerCommentary = () => {
    const pageName = TAB_COMMENTARY;
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const location = useLocation();
    const [isDataLoading, setIsDataLoading] = useState(false)

    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.commentary);


    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            Navigate("/dashboard")
        }
    }, []);

    const commentaryId = location.state?.commentaryId || "0";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {(isLoading || isDataLoading) && <SpinnerModel />}
                                <Row>
                                    <Breadcrumbs title="ScoreCard" breadcrumbItem="Update Team Players" />
                                    <Row>
                                        {Array(2).fill(null).map((item, index) => (
                                            <div key={index} class="col-12 col-lg-6 col-sm-6 col-md-6">
                                                <Card>
                                                    <CardHeader>
                                                        Team Name {index + 1}
                                                    <div class="row card-body">
                                                        <div class="col mb-1 mb-lg-0 mb-md-0 mb-sm-1">
                                                            <Select
                                                                class="form-control"
                                                                value={[]
                                                                }
                                                                options={[]
                                                                }
                                                            />
                                                        </div>
                                                        <div class="col-auto">
                                                            <Button
                                                                color="success"
                                                                className="add-btn"
                                                                id="create-btn"
                                                            >
                                                                <i className="ri-add-line align-bottom me-1"></i>{" "}
                                                                Add
                                                            </Button>
                                                        </div>
                                                        <div class="col-auto">
                                                            <Button
                                                                color={"primary"}
                                                                className="btn"
                                                            >
                                                                Reload
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div class="rounded row border border-secondary card-body mx-3 mb-3">
                                                        {Array(4).fill(null).map((item, index) => (
                                                            <div class="row d-flex align-items-center my-1">
                                                                <div class="col-6">
                                                                    Player {index + 1}
                                                                </div>
                                                                <div class="col-6 d-flex justify-content-end">
                                                                    <button type="button" class="btn btn-primary">Delete</button>
                                                                </div>
                                                            </div>)
                                                        )}
                                                    </div>
                                                    </CardHeader>
                                                </Card>
                                            </div>)
                                        )}
                                    </Row>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >

    )
}

export default PlayerCommentary;