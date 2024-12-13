import React, { useState } from "react";

const CricketField = ({ runs, boundary, line, setLine }) => {
  const [drawingLine, setDrawingLine] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const fieldCenter = { x: 0, y: 0 };
  
  const fieldingPositions = {
    "Long Stop": { x: 0, y: -153 },
    "Long Leg": { x: 73, y: -147 },
    "Deep_tr": { x: 120, y: -113 },
    "Straight_t": { x: 33, y: -130 },
    "Fine Leg": { x: 87, y: -100 },
    "Square_r": { x: 140, y: -67 },
    "Deep Backward_r": { x: 153, y: -40 },
    "Deep_r": { x: 170, y: -3 },
    "Deep Forward": { x: 170, y: 33 },
    "Deep (Sweeper)": { x: 160, y: 87 },
    "Deep forward": { x: 127, y: 133 },
    "Wide_r": { x: 107, y: 173 },
    "Long On": { x: 67, y: 183 },
    "Straight_br": { x: 40, y: 200 },
    "Straight Hit": { x: 0, y: 193 },
    "Straight_bl": { x: -40, y: 200 },
    "Long Off": { x: -73, y: 187 },
    "Wide_l": { x: -107, y: 173 },
    "Deep Extra Cover": { x: -133, y: 133 },
    "Deep_lb": { x: -160, y: 90 },
    "Deep Cover Point": { x: -167, y: 47 },
    "Deep_lt": { x: -170, y: -3 },
    "Deep Backward_l": { x: -157, y: -47 },
    "Square_l": { x: -127, y: -87 },
    "Third Man": { x: -90, y: -107 },
    "Deep_tl": { x: -90, y: -130 },
    "Fine": { x: -60, y: -147 },
    "Short Inner_l": { x: -67, y: -83 },
    "Short Inner_r": { x: 67, y: -80 },
    "Backward Short Leg": { x: 73, y: -53 },
    "Backward_r": { x: 103, y: -20 },
    "Square Leg": { x: 100, y: 0 },
    "Forward_r": { x: 103, y: 20 },
    "Mid Wicket": { x: 100, y: 63 },
    "Deep Inner_r": { x: 37, y: 130 },
    "Deep Inner_l": { x: -33, y: 130 },
    "Extra Cover": { x: -100, y: 87 },
    "Cover": { x: -100, y: 60 },
    "Cover Point": { x: -120, y: 30 },
    "Forward_l": { x: -97, y: 10 },
    "Point": { x: -103, y: -3 },
    "Backward_l": { x: -97, y: -20 },
    "Gully": { x: -83, y: -27 },
    "Mid Off": { x: -33, y: 100 },
    "Mid On": { x: 30, y: 100 },
    "Fly Slip": { x: -40, y: -53 },
    "Slips": { x: -23, y: -43 },
    "Wicket Keeper": { x: 0, y: -13 },
    "Bowler": { x: -13, y: 80 },
    "Leg Gully": { x: 57, y: -33 },
    "Leg Slip": { x: 27, y: -27 },
    "Short Leg": { x: 33, y: -3 },
    "Silly Mid On": { x: 33, y: 20 },
    "Silly Mid Off": { x: -33, y: 20 },
    "Silly Point": { x: -30, y: 0 },
    "Short_l": { x: -47, y: 37 },
    "Short_r": { x: 47, y: 30 },
    "Short_bl": { x: -33, y: 53 },
    "Short_br": { x: 33, y: 53 },
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const relativeX = offsetX - 200 || 0; // Adjust to center
    const relativeY = offsetY - 180 || 0; // Adjust to center
    setDrawingLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX: relativeX,
      endY: relativeY,
    });
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const relativeX = offsetX - 200 || 0;
    const relativeY = offsetY - 180 || 0;
    setHoverPosition({ x: relativeX, y: relativeY });

    if (drawingLine) {
      const { offsetX, offsetY } = e.nativeEvent;
      const relativeX = offsetX - 200 || 0;
      const relativeY = offsetY - 180 || 0;
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
    const offsetX = clientX - 200; // Adjust to center
    const offsetY = clientY - 180; // Adjust to center
    setDrawingLine({
      startX: fieldCenter.x,
      startY: fieldCenter.y,
      endX: offsetX,
      endY: offsetY,
    });
  };

  const handleTouchMove = (e) => {
    const { clientX, clientY } = e.touches[0];
    const offsetX = clientX - 200; // Adjust to center
    const offsetY = clientY - 180; // Adjust to center
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
    <div className="cricket-field">
      <img
        src="/images/cricket_field.png"
        alt="Cricket Field"
        className="cricket-field-img"
      />
      <svg
        width="400"
        height="400"
        className="cricket-field-svg"
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
            x={fieldingPositions[position].x + 200}
            y={fieldingPositions[position].y + 180}
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
            x1={line.startX + 200}
            y1={line.startY + 180}
            x2={line.endX + 200}
            y2={line.endY + 180}
            stroke={line.boundary ? "blue" : "red"}
            strokeWidth="2"
          />
        )}

        {/* Draw temporary line */}
        {drawingLine && !isNaN(drawingLine.startX) && !isNaN(drawingLine.startY) && !isNaN(drawingLine.endX) && !isNaN(drawingLine.endY) && (
          <line
            x1={drawingLine.startX + 200}
            y1={drawingLine.startY + 180}
            x2={drawingLine.endX + 200}
            y2={drawingLine.endY + 180}
            // stroke="gray"
            // strokeWidth="1"
            // strokeDasharray="5,5"
            // strokeLinecap="round"
          />
        )}

        {hoverPosition && (
          <line
            x1={fieldCenter.x + 200}
            y1={fieldCenter.y + 180}
            x2={hoverPosition.x + 200}
            y2={hoverPosition.y + 180}
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