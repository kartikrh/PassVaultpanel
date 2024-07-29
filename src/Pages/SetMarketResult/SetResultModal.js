import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useDispatch } from "react-redux";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const SetResultModal = ({ isOpen, toggle, data, fetchData }) => {
  const dispatch = useDispatch();

  const handleSetResult = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/setMarketIsResult`, {
        eventMarketId: data.eventMarketId,
        isResult: !data.isResult,
      })
      .then((response) => {
        fetchData();
        toggle();
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
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" className="custom-modal">
        <ModalHeader toggle={toggle}>Set Market Result</ModalHeader>
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
                  <th>Result</th>
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
                  <td>{data.result}</td>
                </tr>
              </tbody>
            </table>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="hstack gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                toggle();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              id="add-btn"
              onClick={() => {
                handleSetResult();
              }}
            >
              Ok
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SetResultModal;
