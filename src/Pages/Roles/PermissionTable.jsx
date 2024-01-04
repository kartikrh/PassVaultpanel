import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import { Table } from "reactstrap";
// import styles from "./PagePermission.module.css";

function MyTable({ data, columns, isParent = true }) {
    const [paddingMap, setPaddingMap] = useState(new Map()); // Initialize a map to store padding values
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({
            columns,
            data,
        });

    useEffect(() => {
        const newPaddingMap = new Map(); // Create a new map
        let currentNestingLevel = 0;

        // Iterate through rows and calculate padding based on nesting level
        rows.forEach((row) => {
            const parentId = row.original.parentId;
            let padding = "0px";

            if (parentId === "0") {
                currentNestingLevel = 0; // Reset the nesting level to 0 for root rows
            } else if (newPaddingMap.has(parentId)) {
                // If parentId already exists in the map, reuse the value
                padding = newPaddingMap.get(parentId);
            } else {
                currentNestingLevel++;
                padding = `${currentNestingLevel * 20}px`;
                newPaddingMap.set(parentId, padding);
            }

            newPaddingMap.set(row.id, padding);
        });

        setPaddingMap(newPaddingMap); // Update the padding map
    }, [rows]);

    return (
        <Table
            {...getTableProps()}
            striped
            style={{ borderCollapse: "collapse" }}
        >
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th
                                {...column.getHeaderProps()}
                            >
                                {column.render("Header")}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);

                    // Calculate padding based on the row's ID and the padding map
                    const paddingLeft = paddingMap.get(row.id) || "0px";

                    return (
                        <React.Fragment key={row.id}>
                            <tr {...row.getRowProps()} >
                                {row.cells.map((cell, cellIndex) => {
                                    // Rest of your cell rendering logic ...

                                    return (
                                        <td
                                            {...cell.getCellProps()}
                                            style={
                                                cell.column.id === "displayName"
                                                    ? {
                                                        paddingLeft,
                                                        width:
                                                            cellIndex >= columns.length - 3
                                                                ? "50px"
                                                                : "auto",
                                                    }
                                                    : {}
                                            }
                                        >
                                            <span >
                                                {cell.render("Cell")}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        </React.Fragment>
                    );
                })}
            </tbody>
        </Table>
    );
}

export default MyTable;
