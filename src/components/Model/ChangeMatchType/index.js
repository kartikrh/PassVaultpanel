import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import axiosInstance from "../../../Features/axios";
import ReactSelect from 'react-select';


export const ChnageMatchTypeModel = ({changeModelVisible, setChangeModelVisible, selectedCommentary,setSelectedCommentary, handleChange, setMatchType, singleCheck}) => {
    const [matchTypeList, setMatchTypeList] = useState([])
    const fetchData = async (latestValueFromTable) => {
        await axiosInstance
          .post(`/admin/commentary/getMatchTypeListByCommentary`, {
            "commentaryId": selectedCommentary?.commentaryId,
          })
          .then((response) => {
            const apiData = response?.result
            console.log(apiData)
            let apiDataIdList = [];
            apiData.forEach(ele => {
              apiDataIdList.push({label: ele?.matchType, value : ele?.matchTypeId})
            })
            setMatchTypeList(apiDataIdList)
          })
          .catch((error) => {
          });
      };
      useEffect(()=>{
        fetchData()
        console.log("this is selectedCommenraty ===>>>",selectedCommentary)
      },[])
      useEffect(()=>{
        console.log("B",selectedCommentary)
      },[selectedCommentary])
    return (
    <Modal isOpen={changeModelVisible} toggle={() => {setChangeModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-left text-lg">Change Match Type</h4>
                <div className="d-flex mt-4">
                <div style={{marginRight:"20px"}}>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>Event Name:</span>
                    <span >{selectedCommentary?.eventName}</span>
                </div>
                <div>
                    <span style={{marginRight:"10px", fontWeight:"700"}}>RefId:</span>
                    <span>{selectedCommentary?.eventRefId}</span>
                </div>
                </div>
                <h6 className='text-left mt-4'>Match Type</h6>
                <ReactSelect
                      classNamePrefix="select2-selection"
                      id="matchType"
                      name="matchType"
                      defaultValue={{label: selectedCommentary?.matchType, value: selectedCommentary?.eventRefId}}
                      options={matchTypeList}
                      onChange={(e) => {
                        setSelectedCommentary({
                        matchTypeId: e?.value,
                        commentaryId: selectedCommentary?.commentaryId,
                        })
                      }}
                      required={true}
                    />
            </div>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={() => {setChangeModelVisible(false)}}>Close</button>
                <button type="submit" className="btn btn-primary" onClick={()=>{handleChange()}}>Change Match Type</button>
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}