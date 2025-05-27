export const StatusSymbol = ({ valueToShow }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        fontSize: 10,
        color: "#fff",
      }}
    >
      {valueToShow}
    </div>
  );
};
