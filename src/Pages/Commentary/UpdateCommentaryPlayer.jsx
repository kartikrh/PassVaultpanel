import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { PERMISSION_VIEW, TAB_COMMENTARY } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Button, Card, CardBody, Container, Row } from "reactstrap";
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
                                    <div class="row">
                                        {Array(2).fill(null).map((item, index) => (
                                            <div key={index} class="col-12 col-lg-6 col-sm-6 col-md-6">
                                                <div class="card border border-1 border-primary">
                                                    <div class="card-header">
                                                        Team Name {index + 1}
                                                    </div>
                                                    <div class="row card-body">
                                                        <div class="col">
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
                                                                color={"primary"}
                                                                className="btn"
                                                            >
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
                                                    <div class="rounded row border border-success card-body mx-3 mb-3">
                                                        {Array(4).fill(null).map((item, index) => (
                                                            <div class="row d-flex align-items-center">
                                                                <div class="col-12 col-lg-6 col-sm-6 col-md-6 mb-1">
                                                                    Player {index + 1}
                                                                </div>
                                                                <div class="col-12 col-lg-6 col-sm-6 col-md-6 mb-1">
                                                                    <button type="button" class="btn btn-primary">Delete</button>
                                                                </div>
                                                            </div>)
                                                        )}
                                                    </div>
                                                </div>
                                            </div>)
                                        )}
                                    </div>
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