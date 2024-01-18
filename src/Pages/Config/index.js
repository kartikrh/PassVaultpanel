import React from 'react'
import { Container, Table } from 'reactstrap'
import SpinnerModel from "../../components/Model/SpinnerModel";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";

const Index = () => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Block" />
          {/* {isLoading && <SpinnerModel />} */}
          <Table
            // ref={finalizeRef}
            // columns={columns}
            // dataSource={data}
            // tableElement={tableElement}
            // deleteModelFunction={setDeleteModelVisable}
            // singleCheck={checekedList}
            // reFetchData={fetchData}
            // onAddNavigate={"/addblocks"}
            // isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            // isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            // deleteModelVisable={deleteModelVisable}
            // setDeleteModelVisable={setDeleteModelVisable}
            // handleDelete={handleDelete}
            // singleCheck={checekedList}
          />
          <TabModel
            // addModelVisable={addModelVisable}
            // setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  )
}

export default Index
