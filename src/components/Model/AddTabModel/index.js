import React,{useState, useEffect} from 'react'
import { Button, Card, CardBody, CardHeader, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, Row, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";


const Index = ({addModelVisable, setAddModelVisable}) => {
    const [modal_list, setmodal_list] = useState(false);
    function tog_list() {
        setmodal_list(!modal_list);
    }
    
    const [modal_delete, setmodal_delete] = useState(false);
    function tog_delete() {
        setmodal_delete(!modal_delete);
    }
    return (
    <Modal isOpen={addModelVisable} toggle={() => {setAddModelVisable(false)}} centered >
    <ModalHeader className="bg-light p-3" id="exampleModalLabel" toggle={() => {setAddModelVisable(false)}}>Add New Tab</ModalHeader>
    <form className="tablelist-form">
        <ModalBody>
            <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                <label htmlFor="id-field" className="form-label">ID</label>
                <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
            </div>

            <div className="mb-3">
                <label htmlFor="customername-field" className="form-label">Customer Name</label>
                <input type="text" id="customername-field" className="form-control" placeholder="Enter Name" required />
            </div>

            <div className="mb-3">
                <label htmlFor="email-field" className="form-label">Email</label>
                <input type="email" id="email-field" className="form-control" placeholder="Enter Email" required />
            </div>

            <div className="mb-3">
                <label htmlFor="phone-field" className="form-label">Phone</label>
                <input type="text" id="phone-field" className="form-control" placeholder="Enter Phone no." required />
            </div>

            <div className="mb-3">
                <label htmlFor="date-field" className="form-label">Joining Date</label>
                <Flatpickr
                    className="form-control"
                    options={{
                        dateFormat: "d M, Y"
                    }}
                    placeholder="Select Date"
                />
            </div>

            <div>
                <label htmlFor="status-field" className="form-label">Status</label>
                <select className="form-control" data-trigger name="status-field" id="status-field" >
                    <option value="">Status</option>
                    <option value="Active">Active</option>
                    <option value="Block">Block</option>
                </select>
            </div>
        </ModalBody>
        <ModalFooter>
            <div className="hstack gap-2 justify-content-end">
                <button type="button" className="btn btn-light" onClick={() => {setAddModelVisable(false)}}>Close</button>
                <button type="submit" className="btn btn-success" id="add-btn">Add Tab</button>
                {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
            </div>
        </ModalFooter>
    </form>
</Modal>
  )
}

export default Index