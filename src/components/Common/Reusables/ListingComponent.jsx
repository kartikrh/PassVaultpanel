import React from "react";
import "../Table/style.css"
import { Card, CardBody, Col, Row } from "reactstrap";

export const ListingElement = ({ columns, dataSource, tableElement, }) => {
    document.title = `${tableElement?.title}`;
    return (
        <Row>
            <Col lg={12}>
                <Card>
                    <CardBody>
                        <div id="customerList">
                            <Row className="g-2 d-flex align-items-center">
                                <Col className="col-sm-auto">
                                    <span>
                                        {dataSource?.length} Records
                                    </span>
                                    <div className="d-flex align-items-center justify-content-end"></div>
                                </Col>
                            </Row>

                            <div
                                className="table-responsive table-card mt-3 mb-1"
                                id="myTable"
                            >
                                <table
                                    className="table align-middle table-nowrap"
                                    id="customerTable"
                                >
                                    <thead className="table-light">
                                        <tr>
                                            {columns.map((column) => (
                                                <th key={column.key} style={column.style} className={column.className}>
                                                    <div className="d-flex">
                                                        <span>{column.title}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="list form-check-all">
                                        {dataSource.map((record, index) => (
                                            <tr key={index} className={`hover`}>
                                                {columns.map((column) => (
                                                    <td key={column.key} style={column.style}>
                                                        {column.render
                                                            ? column.render(
                                                                record[column.dataIndex],
                                                                record
                                                            )
                                                            : record[column.dataIndex]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="noresult" style={{ display: "none" }}>
                                    <div className="text-center">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                            trigger="loop"
                                            colors="primary:#121331,secondary:#08a88a"
                                            style={{ width: "75px", height: "75px" }}
                                        ></lord-icon>
                                        <h5 className="mt-2">Sorry! No Result Found</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
}