import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({ logModelVisable, setLogModelVisable, logData }) => {
  const [modal_log, setModal_log] = useState(true);
  function tog_log() {
    setModal_log(!modal_log);
  }
  const parsedLogData = typeof logData === "string" ? JSON.parse(logData) : logData;
  return (
    <Modal
      isOpen={logModelVisable}
      toggle={() => {
        setLogModelVisable(false);
      }}
      size="lg"
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setLogModelVisable(false);
        }}
      >
        Log Data
      </ModalHeader>
      <div className="tablelist-form">
        {parsedLogData.length !== 0 ? (
          <ModalBody>
            <div className="card card-shadow p-0">
              <div className="table-responsive">
                <table className="widget-table table no-border table-striped">
                  <thead>
                    <tr>
                      <th>runnerId</th>
                      <th>runner</th>
                      <th>line</th>
                      <th>underRate</th>
                      <th>overRate</th>
                      <th>noRate</th>
                      <th>yesRate</th>
                      <th>noPoint</th>
                      <th>yesPoint</th>
                      <th>order</th>
                      {/* <th>selectionId</th>
                      <th>selectionStatus</th>
                      <th>eventMarketId</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedLogData && parsedLogData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.runnerId}</td>
                        <td>{item.runner}</td>
                        <td>{item.line}</td>
                        <td>{item.underRate}</td>
                        <td>{item.overRate}</td>
                        <td>{item.noRate}</td>
                        <td>{item.yesRate}</td>
                        <td>{item.noPoint}</td>
                        <td>{item.yesPoint}</td>
                        <td>{item.order}</td>
                        {/* <td>{item.selectionId}</td>
                        <td>{item.selectionStatus}</td>
                        <td>{item.eventMarketId}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ModalBody>
        ) : (
          <ModalBody>
            <h6 className="text-center">No Data Available</h6>
          </ModalBody>
        )}
      </div>
    </Modal>
  );
};

export default Index;