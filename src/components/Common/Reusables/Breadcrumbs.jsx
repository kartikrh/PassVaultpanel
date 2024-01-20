
export const ReusableBreadcrumbs = ({ listToRender = [], updateClickedId }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-light rounded">
                {
                    console.log(listToRender)
                }
                {listToRender.map((tab, index) => (
                    <li
                        key={index}
                        className={`breadcrumb-item ${index === listToRender.length - 1 ? 'active' : 'disabled'}`}
                        aria-current={index === listToRender.length - 1 ? 'page' : ''}
                        onClick={() => updateClickedId(tab.value)}
                    >
                        <span className="clickable" style={{cursor:"pointer"}}>
                            {tab.label}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
