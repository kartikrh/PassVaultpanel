import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const Index = ({
  domainsModelVisable,
  setDomainsModelVisable,
  subDomains,
}) => {
  const [modal_delete, setmodal_delete] = useState(true);
  function tog_delete() {
    setmodal_delete(!modal_delete);
  }
  return (
    <Modal
      isOpen={domainsModelVisable}
      toggle={() => {
        setDomainsModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setDomainsModelVisable(false);
        }}
      >
        Sub Domains
        {/* TODO, do we need to add teh screen name also like delete tabs or delete Penelty run */}
      </ModalHeader>
      <div className="tablelist-form">
      {subDomains.length!==0? <ModalBody>
          <div className="card card-shadow p-0">
            <div className="table-responsive">
             <table className="widget-table table no-border table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sub Domains</th>
                  </tr>
                </thead>
                <tbody>
                  {subDomains.map((value, index)=>(
                    <tr className="">
                    <td>{value?.subScribesSubDomainId}</td>
                    <td>{value?.siteSubDomain}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ModalBody>: <ModalBody><h6 className="text-center">No Data Avalable</h6></ModalBody>}
      </div>
    </Modal>
  );
};

export default Index;
