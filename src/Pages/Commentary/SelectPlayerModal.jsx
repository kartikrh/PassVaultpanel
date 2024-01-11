import React, { useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';

const SelectPlayerModal = ({ playerList, toggle, modal, selectPlayer }) => {
    const [players, setPlayers] = useState(playerList);
    const [search, setSearch] = useState("");

    const onSearch = (e) => {
        const query = e.target.value;
        setSearch(query);
        // const filteredPlayers = players.filter(value=>value.playerName.toLowerCase().includes(query));
        // setPlayers(filteredPlayers)
    }

    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={modal} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Select Player
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    <thead>
                        <Input
                            className="form-control mb-3"
                            type="text"
                            placeholder='Player Name'
                            value={search}
                            onChange={onSearch}
                        />
                    </thead>
                    <tbody>
                        {players.map(value => <tr key={value.playerId}>
                            <td role='button' onClick={() => selectPlayer(value.playerId)} >{value.playerName}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    )
}

export default SelectPlayerModal