// // DraggableTable.js
// import React,{useEffect, useState} from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { Button } from "reactstrap";
// const DraggableTable = () => {

//  // model state
//  const [addModelVisable, setAddModelVisable] = useState(false);
//  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

//  // checkbox state
//  const [checkedAll, setCheckedAll] = useState(false);
//  const [singleCheck, setSingleCheck] = useState([]);

//  // permission stats
//  const [isAdd, setIsAdd] = useState([])
//  const [isEdit, setIsEdit] = useState([])
//  const [isDelete, setIsDelete] = useState([])

//  //checkbox function
//  const handleCheckedAll = (e) => {
//    if (e === "all") {
//      if (checkedAll) {
//        setCheckedAll(false);
//        setSingleCheck([]);
//      } else {
//        setCheckedAll(true);
//      }
//    } else {
//      if(singleCheck.includes(e.key)){
//        setSingleCheck(singleCheck.filter(item => item !== e.key))
//      }else{
//        setSingleCheck([...singleCheck, e.key]);
//      }
//    }
//  };

//  //permissions function
//  const handlePermissions = (pType, key) =>{
//    console.log(key)
//    if(pType === "add"){
//      if(isAdd.includes(key)){
//        setIsAdd(isAdd.filter(item => item !== key))
//      }else{
//        setIsAdd([...isAdd, key]);
//      }
//    }else if(pType === "edit"){
//      if(isEdit.includes(key)){
//        setIsEdit(isEdit.filter(item => item !== key))
//      }else{
//        setIsEdit([...isEdit, key]);
//      }
//    }
//    else if(pType === "delete"){
//      if(isDelete.includes(key)){
//        setIsDelete(isDelete.filter(item => item !== key))
//      }else{
//        setIsDelete([...isDelete, key]);
//      }
//    }
//  }

//  const columns = [
//     {
//       title: (
//         <div className="form-check">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             name="chk_child"
//             value="option1"
//             onChange={() => {
//               handleCheckedAll("all");
//             }}
//           />
//         </div>
//       ),
//       render: (text, record) => (
//         <div className="form-check d-flex align-items-center justify-between">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             name="chk_child"
//             value="option1"
//             checked={checkedAll || singleCheck.includes(record.key)}
//             onChange={() => {
//               handleCheckedAll(record);
//             }}
//           />
//           <i className="bx bx-move ms-1"></i>
//         </div>
//       ), // Use 'select' as a placeholder key for the checkbox column
//       key: "select",
//       style: { width: "2%" },
//     },
//     {
//       title: "Edit",
//       key: "edit",
//       render: (text, record) => <i className="bx bx-edit"></i>,
//       style: { width: "2%", textAlign: "center" },
//     },
//     {
//       title: "Tab Name",
//       dataIndex: "tabName",
//       key: "tabName",
//       style: { width: "10%" },
//     },
//     {
//       title: "Display Name",
//       dataIndex: "displayName",
//       key: "displayName",
//       sort:true,
//       style: { width: "10%" },
//     },
//     {
//       title: "Display Type",
//       dataIndex: "displayType",
//       key: "displayType",
//       sort:true,
//       style: { width: "10%" },
//     },
//     {
//       title: "WebPage Route",
//       dataIndex: "webPage",
//       key: "webPage",
//       style: { width: "10%" },
//     },
//     {
//       title: "No. of Child",
//       dataIndex: "childrenCount",
//       key: "childrenCount",
//       style: { width: "10%" },
//       sort:true,
//     },
//     {
//       title: "Is Add",
//       key: "add",
//       render: (text, record) => (
//         <Button color={`${isAdd.includes(record.key)?"danger":"primary"}`} size="sm" className="btn" onClick={()=>{handlePermissions("add",record.key)}}>
//           <i className="bx bx-block"></i>
//         </Button>
//       ),
//       style: { width: "2%", textAlign: "center" },
//     },
//     {
//       title: "Is Edit",
//       key: "isEdit",
//       render: (text, record) => (
//         <Button color={`${isEdit.includes(record.key)?"danger":"primary"}`} size="sm" className="btn" onClick={()=>{handlePermissions("edit",record.key)}}>
//           {" "}
//           <i className="bx bx-block"></i>
//         </Button>
//       ),
//       style: { width: "2%", textAlign: "center" },
//     },
//     {
//       title: "Is Delete",
//       key: "delete",
//       render: (text, record) => (
//         <Button color={`${isDelete.includes(record.key)?"danger":"primary"}`} size="sm" className="btn" onClick={()=>{handlePermissions("delete",record.key)}}>
//           <i className="bx bx-block"></i>
//         </Button>
//       ),
//       style: { width: "2%", textAlign: "center" },
//     },
//   ];

//   const data = [
//     {
//       key: 1,
//       tabName: "CMS",
//       displayName: "CMS",
//       displayType: "Admin",
//       webPage: "/",
//       childrenCount: "3",
//     },
//     {
//       key: 2,
//       tabName: "Master",
//       displayName: "Master",
//       displayType: "Admin",
//       webPage: "/",
//       childrenCount: "8",
//     },
//     {
//       key: 3,
//       tabName: "dashboard",
//       displayName: "Dashboard",
//       displayType: "Admin",
//       webPage: "/dashboard",
//       childrenCount: "0",
//     },
//     {
//       key: 4,
//       tabName: "Players",
//       displayName: "Players",
//       displayType: "Agent",
//       webPage: "/Player",
//       childrenCount: "0",
//     },
//     {
//       key: 5,
//       tabName: "Users",
//       displayName: "Users",
//       displayType: "Agent",
//       webPage: "/users",
//       childrenCount: "0",
//     },
//     {
//       key: 6,
//       tabName: "Score",
//       displayName: "Score",
//       displayType: "Vendor",
//       webPage: "/score",
//       childrenCount: "0",
//     },
//     {
//       key: 7,
//       tabName: "match",
//       displayName: "Match",
//       displayType: "Agent",
//       webPage: "/match",
//       childrenCount: "0",
//     },
//   ];
//   const onDragEnd = (result) => {
//     if (!result.destination) {
//       return; // Dragged outside the list
//     }
    
//     const reorderedData = Array.from(data);
//     const [removed] = reorderedData.splice(result.source.index, 1);
//     reorderedData.splice(result.destination.index, 0, removed);
//     // Update your state or perform any action with the reorderedData
//   };

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <Droppable droppableId="table">
//         {(provided) => (
//           <tbody ref={provided.innerRef} {...provided.droppableProps}>
//             {data.map((record, index) => (
//               <Draggable key={record.key} draggableId={record.key} index={index}>
//                 {(provided) => (
//                   <tr
//                     ref={provided.innerRef}
//                     {...provided.draggableProps}
//                     {...provided.dragHandleProps}
//                   >
//                     {columns.map((column) => (
//                       <td key={column.key} style={column.style}>
//                         {column.render
//                           ? column.render(record[column.dataIndex], record)
//                           : record[column.dataIndex]}
//                       </td>
//                     ))}
//                   </tr>
//                 )}
//               </Draggable>
//             ))}
//             {provided.placeholder}
//           </tbody>
//         )}
//       </Droppable>
//     </DragDropContext>
//   );
// };

// export default DraggableTable;


import React from "react";
import { CSVLink } from "react-csv";
