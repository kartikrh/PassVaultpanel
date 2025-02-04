import React, { useState } from "react";

const CricketField = ({ runs, boundary, line, setLine }) => {
  const [drawingLine, setDrawingLine] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const fieldCenter = { x: 0, y: 0 };
  
  const fieldingPositions = {
    "Long Stop": { x: 0, y: -133 },
    "Long Leg": { x: 53, y: -123 },
    "Deep_tr": { x: 100, y: -93 },
    "Straight_t": { x: 30, y: -105 },
    "Fine Leg": { x: 67, y: -80 },
    "Square_r": { x: 120, y: -53 },
    "Deep Backward_r": { x: 133, y: -30 },
    "Deep_r": { x: 150, y: -3 },
    "Deep Forward": { x: 150, y: 30 },
    "Deep (Sweeper)": { x: 140, y: 77 },
    "Deep forward": { x: 107, y: 115 },
    "Wide_r": { x: 87, y: 143 },
    "Long On": { x: 50, y: 160 },
    "Straight_br": { x: 20, y: 170 },
    "Straight Hit": { x: 0, y: 170 },
    "Straight_bl": { x: -25, y: 170 },
    "Long Off": { x: -55, y: 165 },
    "Wide_l": { x: -90, y: 143 },
    "Deep Extra Cover": { x: -113, y: 113 },
    "Deep_lb": { x: -135, y: 75 },
    "Deep Cover Point": { x: -140, y: 38 },
    "Deep_lt": { x: -145, y: -3 },
    "Deep Backward_l": { x: -137, y: -37 },
    "Square_l": { x: -107, y: -67 },
    "Third Man": { x: -70, y: -87 },
    "Deep_tl": { x: -70, y: -110 },
    "Fine": { x: -44, y: -127 },
    "Short Inner_l": { x: -54, y: -70 },
    "Short Inner_r": { x: 47, y: -60 },
    "Backward Short Leg": { x: 66, y: -44 },
    "Backward_r": { x: 83, y: -17 },
    "Square Leg": { x: 80, y: 0 },
    "Forward_r": { x: 80, y: 15 },
    "Mid Wicket": { x: 80, y: 53 },
    "Deep Inner_r": { x: 17, y: 110 },
    "Deep Inner_l": { x: -13, y: 110 },
    "Extra Cover": { x: -72, y: 72 },
    "Cover": { x: -75, y: 53 },
    "Cover Point": { x: -80, y: 28 },
    "Forward_l": { x: -77, y: 10 },
    "Point": { x: -83, y: -3 },
    "Backward_l": { x: -77, y: -13 },
    "Gully": { x: -70, y: -23 },
    "Mid Off": { x: -28, y: 86 },
    "Mid On": { x: 28, y: 86 },
    "Fly Slip": { x: -32, y: -43 },
    "Slips": { x: -15, y: -35 },
    "Wicket Keeper": { x: 3, y: -15 },
    "Bowler": { x: -19, y: 70 },
    "Leg Gully": { x: 50, y: -24 },
    "Leg Slip": { x: 20, y: -20 },
    "Short Leg": { x: 28, y: -2 },
    "Silly Mid On": { x: 31, y: 18 },
    "Silly Mid Off": { x: -20, y: 18 },
    "Silly Point": { x: -25, y: 2 },
    "Short_l": { x: -38, y: 32 },
    "Short_r": { x: 38, y: 32 },
    "Short_bl": { x: -24, y: 42 },
    "Short_br": { x: 20, y: 42 },
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const relativeX = offsetX - 160 || 0; // Adjust to center
    const relativeY = offsetY - 150 || 0; // Adjust to center
    setDrawingLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX: relativeX,
      endY: relativeY,
    });
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const relativeX = offsetX - 160 || 0;
    const relativeY = offsetY - 150 || 0;
    setHoverPosition({ x: relativeX, y: relativeY });

    if (drawingLine) {
      const { offsetX, offsetY } = e.nativeEvent;
      const relativeX = offsetX - 160 || 0;
      const relativeY = offsetY - 150 || 0;
      setDrawingLine({ ...drawingLine, endX: relativeX, endY: relativeY });
    }
  };

  const handleMouseUp = () => {
    if (!drawingLine) return;
  
    const { endX, endY } = drawingLine;
  
    // Find the closest fielding position
    const closestPosition = Object.entries(fieldingPositions).reduce(
      (closest, [name, coords]) => {
        const distance = Math.sqrt(
          Math.pow(endX - coords.x, 2) + Math.pow(endY - coords.y, 2)
        );
        if (distance < closest.distance) {
          return { name, distance };
        }
        return closest;
      },
      { name: null, distance: Infinity }
    );

    const linePositions = Object.entries(fieldingPositions)
    .filter(([name, coords]) => {
      const startToEndDistance = Math.sqrt(
        Math.pow(endX - drawingLine.startX, 2) + Math.pow(endY - drawingLine.startY, 2)
      );
      const startToPosDistance = Math.sqrt(
        Math.pow(coords.x - drawingLine.startX, 2) + Math.pow(coords.y - drawingLine.startY, 2)
      );
      const posToEndDistance = Math.sqrt(
        Math.pow(endX - coords.x, 2) + Math.pow(endY - coords.y, 2)
      );
      // Check if the position is close enough to be considered "on" the line
      return startToPosDistance + posToEndDistance <= startToEndDistance + 10; // 10 is a threshold to consider a point on the line
    })
    .map(([name]) => name);

    setLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX,
      endY,
      position: closestPosition.name,
      runs,
      boundary,
      passedPositions: linePositions,
    });
    setDrawingLine(null);
  };

  const handleTouchStart = (e) => {
    const { clientX, clientY } = e.touches[0];
    const offsetX = clientX - 160; // Adjust to center
    const offsetY = clientY - 150; // Adjust to center
    setDrawingLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX: offsetX,
      endY: offsetY,
    });
  };

  const handleTouchMove = (e) => {
    const { clientX, clientY } = e.touches[0];
    const offsetX = clientX - 160; // Adjust to center
    const offsetY = clientY - 150; // Adjust to center
    setHoverPosition({ x: offsetX, y: offsetY });

    if (drawingLine) {
      setDrawingLine({ ...drawingLine, endX: offsetX, endY: offsetY });
    }
  };

  const handleTouchEnd = () => {
    if (!drawingLine) return;

    const { endX, endY } = drawingLine;

    // Find the closest fielding position
    const closestPosition = Object.entries(fieldingPositions).reduce(
      (closest, [name, coords]) => {
        const distance = Math.sqrt(
          Math.pow(endX - coords.x, 2) + Math.pow(endY - coords.y, 2)
        );
        if (distance < closest.distance) {
          return { name, distance };
        }
        return closest;
      },
      { name: null, distance: Infinity }
    );

    const linePositions = Object.entries(fieldingPositions)
    .filter(([name, coords]) => {
      const startToEndDistance = Math.sqrt(
        Math.pow(endX - drawingLine.startX, 2) + Math.pow(endY - drawingLine.startY, 2)
      );
      const startToPosDistance = Math.sqrt(
        Math.pow(coords.x - drawingLine.startX, 2) + Math.pow(coords.y - drawingLine.startY, 2)
      );
      const posToEndDistance = Math.sqrt(
        Math.pow(endX - coords.x, 2) + Math.pow(endY - coords.y, 2)
      );
      // Check if the position is close enough to be considered "on" the line
      return startToPosDistance + posToEndDistance <= startToEndDistance + 10; // 10 is a threshold to consider a point on the line
    })
    .map(([name]) => name);

    setLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX,
      endY,
      position: closestPosition.name,
      runs,
      boundary,
      passedPositions: linePositions
    });
    setDrawingLine(null);
  };

  return (
    <div className="">
      <img
        src="/images/cricket_field.png"
        alt="Cricket Field"
        className="cricket-field-img"
      />
      <svg
        width="322"
        height="338"
        className="cricket-field-svg-new"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Draw positions */}
        {Object.keys(fieldingPositions).map((position) => (
          <text
            key={position}
            x={fieldingPositions[position].x + 160}
            y={fieldingPositions[position].y + 150}
            fontSize="10"
            fill="black"
            textAnchor="middle"
          >
            {/* {position} */}
          </text>
        ))}

        {/* Draw lines */}
        {line && !isNaN(line.startX) && !isNaN(line.startY) && !isNaN(line.endX) && !isNaN(line.endY) && (
          <line
            x1={line.startX + 160}
            y1={line.startY + 150}
            x2={line.endX + 160}
            y2={line.endY + 150}
            stroke={line.boundary ? "blue" : "red"}
            strokeWidth="2"
          />
        )}

        {/* Draw temporary line */}
        {drawingLine && !isNaN(drawingLine.startX) && !isNaN(drawingLine.startY) && !isNaN(drawingLine.endX) && !isNaN(drawingLine.endY) && (
          <line
            x1={drawingLine.startX + 160}
            y1={drawingLine.startY + 150}
            x2={drawingLine.endX + 160}
            y2={drawingLine.endY + 150}
            // stroke="gray"
            // strokeWidth="1"
            // strokeDasharray="5,5"
            // strokeLinecap="round"
          />
        )}

        {hoverPosition && (
          <line
            x1={fieldCenter.x + 160}
            y1={fieldCenter.y + 150}
            x2={hoverPosition.x + 160}
            y2={hoverPosition.y + 150}
            stroke="darkred"
            strokeWidth="1"
            strokeDasharray="5,5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

export default CricketField;