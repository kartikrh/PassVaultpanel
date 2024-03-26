import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const CloseModal = ({ isOpen, toggle, data, fetchData }) => {
  const dispatch = useDispatch();

  const handleYesClick = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/setMarketClose`, {
        eventMarketId: data.eventMarketId,
        commentaryId: data.commentaryId,
      })
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
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
      <ModalHeader toggle={toggle}>Close Market</ModalHeader>
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
                  <span style={{ cursor: "pointer" }}>
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
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleYesClick}>
          Ok
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CloseModal;
