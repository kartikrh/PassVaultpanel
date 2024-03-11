import React from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

function ShortCommentaryScreen(props) {
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Short Commentary </h3>
                        </Col>
                        <Card>
                            <CardBody>

                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default ShortCommentaryScreen;
