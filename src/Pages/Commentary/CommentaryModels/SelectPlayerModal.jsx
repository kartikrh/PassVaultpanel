import React, { useEffect, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';

const SelectPlayerModal = ({ playerList, toggle, isOpen, selectPlayer }) => {
    const [players, setPlayers] = useState(playerList);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setSearch("");
        setPlayers(playerList);
    }, [isOpen, playerList]);

    useEffect(() => {
        const filteredPlayers = playerList?.filter(value => value.playerName.toLowerCase().includes(search.toLowerCase()));
        setPlayers(filteredPlayers)
    }, [search])

    return (
        <Modal className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
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
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </thead>
                    <tbody>
                        {players?.map(value => <tr key={value.commentaryPlayerId}>
                            <td role='button' onClick={() => selectPlayer(value.commentaryPlayerId)} >{value.playerName}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    )
}

export default SelectPlayerModal