import React,{useState, useEffect} from 'react'
import {Modal, ModalBody } from 'reactstrap';
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import ReactSelect from 'react-select';
import { ERROR } from "../../Common/Const";

export const ChangePythonType = ({changeModelVisible, setChangeModelVisible, selectedCommentary,setSelectedCommentary, handleChange, setMatchType, singleCheck}) => {
    const [pythonList, setPythonList] = useState([])
    const [selectedCommentaryVals, setSelectedCommentaryVals] = useState({})
    const dispatch = useDispatch();
    useEffect(()=>{
      setSelectedCommentaryVals(selectedCommentary)
    },[])
    const fetchData = async (latestValueFromTable) => {
        await axiosInstance
          .post(`/admin/commentary/pythonAPIs`, {
            "commentaryId": selectedCommentary?.commentaryId,
          })
          .then((response) => {
            const apiData = response?.result;
            let apiDataIdList = [];
            apiData.forEach(ele => {
              apiDataIdList.push({label: ele?.URI, value : ele?.id})
            })
            setPythonList(apiDataIdList);
          })
          .catch((error) => {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
          });
      };
      useEffect(()=>{
        fetchData()
      },[])
    return (
    <Modal isOpen={changeModelVisible} toggle={() => {setChangeModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-left text-lg modal-header-title">Change Python URI</h4>
                <div className="d-flex my-4">
                <div style={{marginRight:"20px"}}>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>Event Name:</span>
                    <span >{selectedCommentaryVals?.eventName}</span>
                </div>
                <div>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>RefId:</span>
                    <span>{selectedCommentaryVals?.eventRefId}</span>
                </div>
                </div>
                {/* <h6 className='text-left mt-4 modal-header-title'>Python Type</h6> */}
                <ReactSelect
                      classNamePrefix="filter-dropdown"
                      id="pythonURI"
                      name="pythonURI"
                      defaultValue={{label: selectedCommentary?.pythonURI, value: selectedCommentary?.pythonId}}
                      options={pythonList}
                      onChange={(e) => {
                        setSelectedCommentary({
                        pythonId: e?.value,
                        pythonURI: e?.label,
                        commentaryId: selectedCommentary?.commentaryId,
                        })
                      }}
                      required={true}
                    />
            </div>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={() => {setChangeModelVisible(false)}}>Close</button>
                <button type="submit" className="btn btn-primary" onClick={()=>{handleChange()}}>Save</button>
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}