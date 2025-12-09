import React from "react";
import MatchCard from "../ImportEntity/MatchCard";

const MatchCardView = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const stored = id ? localStorage.getItem(id) : null;
    const matchData = stored ? JSON.parse(stored) : null;
    return (
        <div style={{ padding: 20 }}>
            <MatchCard matchData={matchData} />
        </div>
    );
};

export default MatchCardView;