import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { Tooltip } from "antd";

const ResultModal = ({ isOpen, toggle, data, fetchData }) => {
  const [result, setResult] = useState(null);
  const [runners, setRunners] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(null);
  const dispatch = useDispatch();
  const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);  
  const fetchRunners = async () => {
    try {
      const response = await axiosInstance.post("/admin/eventMarket/getRunnerByMarket", {
        eventMarketId: data?.eventMarketId,
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
    if (data && !(data?.marketTypeId == marketTypeObj?.Fancy || data?.marketTypeId == marketTypeObj?.LineMarket)) {
      fetchRunners();
    }
  }, [data]);
  
  const handleYesClick = async () => {
    let payload = {}
    if (data?.marketTypeId == marketTypeObj?.Fancy || data?.marketTypeId == marketTypeObj?.LineMarket) {
      payload = {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
        result: result
      }
    } else {
      payload = {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
        result: selectedRunner,
      }
    }
    await axiosInstance
      .post("/admin/eventMarket/setMarketResult", payload)
      .then((response) => {
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
    setResult(null);
    setSelectedRunner(null);
    toggle();
  };

  const handleButtonClick = (runnerId) => {
    setSelectedRunner((prev) => (prev === runnerId ? null : runnerId));
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      <ModalHeader toggle={toggle}>Set Result Market {data?.marketName}</ModalHeader>
      <ModalBody>
        {data && (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Id</th>
                <th>Event Name</th>
                <th>Competition</th>
                <th>Event</th>
                <th>Market</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="cursor-pointer">
                    {convertDateUTCToLocal(data.eventDate, "index")}
                  </span>
                </td>
                <td>{data.eventMarketId}</td>
                <td>{data.eventTypeName}</td>
                <td>{data.competitionName}</td>
                <td>{data.eventName}</td>
                <td>{data.marketName}</td>
              </tr>
            </tbody>
          </table>
        )}
        {data && (data?.marketTypeId == marketTypeObj?.Fancy || data?.marketTypeId == marketTypeObj?.LineMarket) ? (
          <div className="d-flex align-items-center">
            <Label for="result">Enter Result</Label>
            <Input
              type="number"
              id="result"
              placeholder="Enter result"
              value={result}
              className="result-box"
              onChange={(e) => setResult(+e.target.value)}
            />
          </div>
        ) : (
          runners.length > 0 && (
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
                          onClick={() => handleButtonClick(runner?.runnerId)}
                        >
                          <i className={`bx ${selectedRunner === runner?.runnerId ? "bx-check" : "bx-block"}`}></i>
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleYesClick}>
          Ok
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResultModal;
