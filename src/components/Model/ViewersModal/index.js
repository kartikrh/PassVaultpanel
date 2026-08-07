import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
    viewersModelVisable,
    setViewersModelVisable,
    viewers,
}) => {
    return (
        <Modal
            isOpen={viewersModelVisable}
            toggle={() => {
                setViewersModelVisable(false);
            }}
            centered
        >
            <ModalHeader
                className="bg-light p-3"
                id="exampleModalLabel"
                toggle={() => {
                    setViewersModelVisable(false);
                }}
            >
                Viewers
            </ModalHeader>
            <div className="tablelist-form">
                {viewers.length !== 0 ? <ModalBody>
                    <div className="card card-shadow p-0">
                        <div className="table-responsive">
                            <table className="widget-table table no-border table-striped">
                                <thead>
                                    <tr>
                                        <th>Domain</th>
                                        <th style={{textAlign: "center"}}>Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewers.map((value, index) => (
                                        <tr className="">
                                            <td>{value?.domain ?? "-"}</td>
                                            <td style={{textAlign: "center"}}>{value?.viewerCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ModalBody> : <ModalBody><h6 className="text-center">No Data Avalable</h6></ModalBody>}
            </div>
        </Modal>
    );
};

export default Index;
