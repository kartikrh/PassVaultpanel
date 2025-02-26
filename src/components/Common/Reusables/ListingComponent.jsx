import React from "react";
import "../Table/style.css"
import { Card, CardBody, Col, Row } from "reactstrap";
import { getStatusColor1, getStatusFontColor } from "../../../Pages/Commentary/CommentartConst";

export const ListingElement = ({ columns, dataSource = [], tableElement, tableExtras, tableClassName, hideHeader = false, onSwitch }) => {
    document.title = `${tableElement?.title}`;
    const handleSwitch = (marketId) => {
        onSwitch(marketId);
    };
    return (
        <Row>
            <Col lg={12}>
                <Card className="mb-0">
                    <CardBody className={tableClassName}>
                        {dataSource.length > 0 ? <div id="customerList">
                            {/* {!hideHeader &&
                                <> <Row className="g-2 d-flex align-items-center">
                                    <Col className="col-sm-auto">
                                        <span>
                                            {dataSource?.length} Records
                                        </span>
                                    </Col>
                                </Row>
                                    <Row>
                                        {tableExtras && <>{tableExtras}</>}
                                    </Row>
                                </>} */}
                            <div
                                className="table-responsive table-card"
                                id="myTable"
                            >
                                <table
                                    className="table align-middle table-nowrap mb-0"
                                    id="customerTable"
                                >
                                    <thead className="table-light">
                                        <tr>
                                            {columns.map((column, index) => {
                                              if (column.dataIndex === "marketId") {
                                                column.title = (
                                                    <>
                                                       Market <span>[{dataSource?.length} Records]</span>
                                                    </>
                                                );
                                              }
                                              return (
                                                <th key={index} style={column.style} className={column.className}>
                                                    <div className="d-flex">
                                                        <span>{column.title}</span>
                                                    </div>
                                                </th>
                                              )}
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="list form-check-all">
                                        {dataSource.map((record, index) => (
                                            <tr key={index} style={{ backgroundColor: getStatusColor1(+record?.status) }}>
                                                {columns.map((column, index) => (
                                                    <td key={index}
                                                        style={{color : getStatusFontColor(+record?.status), ...column.style}}
                                                        className={column.columnClassName}>
                                                        {column.dataIndex === "marketId" ? (
                                                            <div className="d-flex align-items-center justify-content-between">
                                                            {column.render(
                                                                record[column.dataIndex],
                                                                record
                                                            )}
                                                            {record?.originalCategory ? <button
                                                              className="btn btn-sm btn-success py-0 px-2" 
                                                              onClick={() => handleSwitch(record?.marketId)}
                                                            >
                                                              +
                                                            </button> : <button
                                                              className="btn btn-sm btn-danger py-0 px-2" 
                                                              onClick={() => handleSwitch(record?.marketId)}
                                                            >
                                                              -
                                                            </button>} </div> ) 
                                                            : column.render 
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
                        </div> : <div className=" m-4 text-center">No record found</div>}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
}