export const PlayerSelection = (props) => {
    return <>
        <button onClick={() => { props.next() }}>Next </button>
        <button onClick={() => { props.previous() }}>Previous </button>
        Player Selection Screen</>
}