import React, { useState } from "react";
import {
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import axiosInstance from "../../Features/axios";
import { useDispatch } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../components/Common/Const";

const CloseAllModel = ({
  closeAllModelVisable,
  setCloseAllModelVisable,
  fetchData,
  singleCheck,
}) => {
  const [modal_delete, setmodal_delete] = useState(true);
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  function tog_deleteAll() {
    setmodal_delete(!modal_delete);
  }

  const handleCloseAll = async (e) => {
    await axiosInstance
      .post(`/admin/eventMarket/allMarketClose`, {
        password: password,
      })
      .then((response) => {
        fetchData();
        setCloseAllModelVisable(false);
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
    <Modal
      isOpen={closeAllModelVisable}
      toggle={() => {
        setCloseAllModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setCloseAllModelVisable(false);
        }}
      >
        Close All Market
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex align-items-center">
            <Label for="pass">Enter Password</Label>
            <Input
              type="password"
              id="pass"
              placeholder="Enter your password"
              value={password}
              style={{ width: "300px", marginLeft: "8px" }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column align-items-center" id="modal-id">
            <span className="mt-4 mb-4">
              Are you sure you want to close all market ?
            </span>
            <div className="hstack gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setCloseAllModelVisable(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                id="add-btn"
                onClick={() => {
                  handleCloseAll();
                }}
              >
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default CloseAllModel;
