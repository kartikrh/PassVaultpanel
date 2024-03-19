import { useState } from "react";
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
import { useDispatch } from "react-redux";

const ResultModal = ({ isOpen, toggle, data, fetchData }) => {
  const [result, setResult] = useState("");
  const dispatch = useDispatch();

  const handleYesClick = async () => {
    await axiosInstance
      .post("/admin/eventMarket/setMarketResult", {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
        result: result,
      })
      .then((response) => {
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        });
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
    setResult("");
    fetchData();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      <ModalHeader toggle={toggle}>Set Result Market</ModalHeader>
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
                <td>{data.eventDate}</td>
                <td>{data.eventMarketId}</td>
                <td>{data.eventTypeName}</td>
                <td>{data.competitionName}</td>
                <td>{data.eventName}</td>
                <td>{data.marketName}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Label for="result">Enter Result</Label>
          <Input
            type="number"
            id="result"
            placeholder="Enter result"
            value={result}
            style={{ width: "400px", marginLeft: "8px" }}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleYesClick}>
          Set Result
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResultModal;
