
export const ReusableBreadcrumbs = ({ listToRender = [], updateClickedId }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-light rounded">
                {listToRender.map((tab, index) => (
                    <li
                        key={index}
                        className={`breadcrumb-item ${index === listToRender.length - 1 ? 'active' : ''}`}
                        aria-current={index === listToRender.length - 1 ? 'page' : ''}
                        onClick={() => updateClickedId(tab.value)}
                    >
                        <span className="clickable">
                            {tab.label}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
