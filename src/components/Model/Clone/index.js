import React,{useState, useEffect} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";


export const MatchTypeClone = ({cloneModelVisible, setCloneModelVisible, handleClone, setCloneName, singleCheck}) => {
    
    return (
    <Modal isOpen={cloneModelVisible} toggle={() => {setCloneModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
            {singleCheck.length===1?<div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-center text-lg">Cloning the Selected Match Type</h4>
                <h6 className='text-center mt-4'>Please Enter the Clone Name</h6>
                <input type="text" onChange={(e)=>{setCloneName(e.target.value)}} className="form-control text-center" required />
            </div>:singleCheck.length>1?<h4 className="text-danger text-center p-4">Select Only One Match Type</h4>:<h4 className="text-danger text-center p-4">Select One MatchTyp To Clone</h4>}
            <div className="hstack gap-2 justify-content-center">
                <button type="button" className="btn btn-light" onClick={() => {setCloneModelVisible(false)}}>Close</button>
                {singleCheck.length===1?
                <button type="submit" className="btn btn-warning" id="add-btn" onClick={()=>{handleClone()}}>Clone Match Type</button>
                :null}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}
export const CommentaryClone = ({cloneModelVisible, cloneValues, setCloneModelVisible, handleClone, setCloneValues, singleCheck}) => {
    const handleCloneValues = (e) =>{
        const {name, value} = e.target;
        setCloneValues((preValue)=>{
            return {
                ...preValue,
                [name]:value
            }
        })
    }
    return (
    <Modal isOpen={cloneModelVisible} toggle={() => {setCloneModelVisible(false)}} centered >
    <div className="tablelist-form">
        <ModalBody>
          <div className="d-flex flex-column justify-content-center p-4">
                <h4 className="form-label text-center text-lg">Cloning the Selected Match Type</h4>
                <h6 className='text-center mt-4'>Enter The Event Name</h6>
                <input type="text" onChange={handleCloneValues} name="eventName" className="form-control text-center" required />
                <h6 className='text-center mt-4'>Enter The Event Ref Id</h6>
                <input type="text" onChange={handleCloneValues} name="eventRefId" className="form-control text-center" required />
            </div>
            <div className="hstack gap-2 justify-content-center">
                <button type="button" className="btn btn-light" onClick={() => {setCloneModelVisible(false)}}>Close</button>
                {singleCheck.length===1?
                <button type="submit" className="btn btn-warning" id="add-btn" onClick={()=>{handleClone()}}>Clone Commentary</button>
                :null}
            </div>
        </ModalBody>
    </div>
</Modal>
  )
}

