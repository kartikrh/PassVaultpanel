import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, ModalBody } from "reactstrap";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR } from "../../Common/Const";
import { Tooltip } from "antd";

export const ChangeMarketResultModel = ({
  resultModelVisible,
  setResultModelVisible,
  selectedResult,
  setSelectedResult,
  handleChange,
  singleCheck,
}) => {
  const [selectedResultVals, setSelectedResultVals] = useState({});
  const [runners, setRunners] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(null);
  const dispatch = useDispatch();

  const fetchRunners = async (eventMarketId) => {
    try {
      const response = await axiosInstance.post("/admin/eventMarket/getRunnerByMarket", {
        eventMarketId: eventMarketId,
      });      
      setRunners(response?.result);
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  useEffect(() => {
    if(selectedResult?.eventMarketId) {
      fetchRunners(selectedResult.eventMarketId);
      setSelectedRunner(selectedResult?.result)
    }
  }, []);

  useEffect(() => {
    setSelectedResultVals(selectedResult);
  }, []);

  const handleButtonClick = (runner) => {
    const isSelected = selectedRunner === runner?.runnerId;
    setSelectedRunner(isSelected ? null : runner?.runnerId);
    setSelectedResult({
      eventMarketId: selectedResult?.eventMarketId,
      result: isSelected ? null : runner.runnerId,
      runner: isSelected ? null : runner.runner,
    });
  };

  return (
    <Modal
      isOpen={resultModelVisible}
      toggle={() => {
        setResultModelVisible(false);
      }}
      centered
    >
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
            <h4 className="form-label text-left text-lg modal-header-title">Change Result</h4>
            <div className="my-4">
              <div style={{ marginRight: "20px" }}>
                <span style={{ marginRight: "10px", fontWeight: "700" }}>
                  Event Name:
                </span>
                <span>{selectedResultVals?.eventName}</span>
              </div>
              <div className="d-flex">
                <div style={{ marginRight: "20px" }}>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    Market Name:
                  </span>
                  <span>{selectedResultVals?.marketName}</span>
                </div>
                <div>
                  <span style={{ marginRight: "10px", fontWeight: "700" }}>
                    RefId:
                  </span>
                  <span>{selectedResultVals?.eventRefId}</span>
                </div>
              </div>
            </div>
            {runners.length > 0 && (
            <table className="table">
              <thead>
                <tr className="runner-row">
                  <th className="text-center">Runner</th>
                  <th className="text-center">Is Active</th>
                </tr>
              </thead>
              <tbody className="runner-tbody">
                {runners?.map((runner) => (
                  <tr key={runner?.runnerId} className="runner-row">
                    <td className="text-center">{runner?.runner}</td>
                    <td className="text-center">
                      <Tooltip title={"Active/Inactive runner"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                        <Button
                          color={selectedRunner === runner?.runnerId ? "primary" : "danger"}
                          size="sm"
                          className="btn"
                          onClick={() => handleButtonClick(runner)}
                        >
                          <i className={`bx ${selectedRunner === runner?.runnerId ? "bx-check" : "bx-block"}`}></i>
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setResultModelVisible(false);
              }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              onClick={() => {
                handleChange(false);
              }}
            >
              Set Market Result
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => {
                handleChange(true);
              }}
            >
              Set Market Result & Approve
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};
