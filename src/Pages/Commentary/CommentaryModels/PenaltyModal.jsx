import React, { useEffect, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import axiosInstance from '../../../Features/axios.js';
import SpinnerModel from "../../../components/Model/SpinnerModel/index.js";

export const PenaltyModal = ({ toggle, isOpen, selectedPenalty }) => {
    const [data, setData] = useState([]);
    const [penaltyList, setPenaltyList] = useState(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState("");

    useEffect(() => {
        fetchData()
    }, [isOpen]);

    const handelSearch = (value = "") => {
        setSearch(value)
        const newPaneltyList = data?.filter(penalty => penalty?.label?.toLowerCase().includes(value.toLowerCase()));
        setPenaltyList(newPaneltyList)
    }

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const inputElement = document.getElementById('penaltyRun');
                if (inputElement) inputElement.focus();
            }, 150);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsLoading(true);
        await axiosInstance
            .post(`/admin/paneltyRun/all`, {})
            .then((response) => {
                const apiData = response?.result
                let apiDataIdList = [];
                apiData?.map(penaltyRun => {
                    if (penaltyRun.isActive) apiDataIdList.push({ label: penaltyRun.desc, value: penaltyRun.run, id: penaltyRun.paneltyId })
                })
                setData(apiDataIdList);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
            });
    };

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Select Penalty Run :
            </ModalHeader>
            <ModalBody>
                {isLoading && <SpinnerModel />}
                <Table responsive>
                    <thead>
                        <Input
                            id="penaltyRun"
                            className="form-control mb-3"
                            type="text"
                            placeholder='Penalty Run Name'
                            value={search}
                            onChange={(e) => handelSearch(e.target.value)}
                        />
                    </thead>
                    <tbody>
                        {(penaltyList || data)?.map(penalty => <tr key={penalty.id}>
                            <td role='button' onClick={() => selectedPenalty(penalty.value)} >{penalty.label}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal >
    )
}