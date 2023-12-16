import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const Table2 = ({dataSource, columns} ) => {
    const [data,setData] = useState(dataSource)
    const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newData = [...data];
    const [movedRow] = newData.splice(result.source.index, 1);
    newData.splice(result.destination.index, 0, movedRow);
    setData(newData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" direction="vertical">
        {(provided) => (
          <table
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <thead>
              <tr>
                {columns.map((header) => (
                  <th key={header.key}>{header.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <Draggable key={rowIndex} draggableId={`row-${rowIndex}`} index={rowIndex}>
                  {(provided) => (
                    <tr
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {columns.map((header) => (
                        <td key={header.key}>{row[header.dataIndex]}</td>
                      ))}
                    </tr>
                  )}
                </Draggable>
              ))}
            </tbody>
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Table2;
