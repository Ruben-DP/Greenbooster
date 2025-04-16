import React from "react";

interface EnergyLabelProps {
  currentEnergyUsage: number;
  totalWarmth: number;
}

const LabelAmounts = {
  "A++++": 0,
  "A+++": 50,
  "A++": 75,
  "A+": 105,
  A: 160,
  B: 190,
  C: 250,
  D: 290,
  E: 335,
  F: 380,
  G: 1000,
};

// Colors for the energy labels
const labelColors = {
  "A++++": "#00703c",
  "A+++": "#00853f",
  "A++": "#319b42",
  "A+": "#4cb648",
  A: "#bfd630",
  B: "#fff200",
  C: "#fdb913",
  D: "#f37021",
  E: "#ed1c24",
  F: "#cf142b",
  G: "#b31b34",
};

export const EnergyLabel = ({
  currentEnergyUsage,
  totalWarmth,
}: EnergyLabelProps) => {
  // Current energy is the original usage
  // New energy is the usage after warmth calculation
  const originalEnergy = currentEnergyUsage;
  const newEnergy = currentEnergyUsage - totalWarmth;

  // Find the correct energy label based on energy value
  const determineEnergyLabel = (value: number) => {
    // Sort labels by their threshold values
    const sortedLabels = Object.entries(LabelAmounts).sort(
      (a, b) => a[1] - b[1]
    );

    // Find the first label where value < next threshold
    for (let i = 0; i < sortedLabels.length - 1; i++) {
      if (value < sortedLabels[i + 1][1]) {
        return sortedLabels[i][0];
      }
    }

    // Check if value is higher than the highest threshold
    if (value >= sortedLabels[sortedLabels.length - 1][1]) {
      return sortedLabels[sortedLabels.length - 1][0]; // Return G
    }

    // Default to lowest efficiency if no match found
    return sortedLabels[0][0]; // Return A++++
  };

  // Get the original and new labels
  const originalLabel = determineEnergyLabel(originalEnergy);
  const newLabel = determineEnergyLabel(newEnergy);

  // Get all labels in order from highest to lowest efficiency (A to G)
  const allLabels = Object.keys(LabelAmounts);

  // Define fixed widths for each energy label with linear progression from 30% to 100%
  const labelWidths = {
    "A++++": 30,
    "A+++": 37,
    "A++": 44,
    "A+": 51,
    A: 58,
    B: 65,
    C: 72,
    D: 79,
    E: 86,
    F: 93,
    G: 100,
  };

  return (
    <>
      <style>
        {`
          .energy-label-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width:100%;
            margin: 0 auto;
          }
          
          .energy-label-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
            text-align: center;
          }
          
          .energy-info-container {
            width: 100%;
            margin-bottom: 24px;
          }
          
          .energy-info-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .energy-info-label {
            font-size: 18px;
            font-weight: 600;
            margin-right: 8px;
          }
          
          .energy-info-value {
            font-size: 18px;
          }
          
          .energy-info-subtext {
            font-size: 14px;
            color: #666;
            margin-bottom: 16px;
          }
          
          .energy-comparison {
            margin-top: 8px;
            width: 100%;
            padding-top: 16px;
          }
          
          .comparison-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            text-align: center;
          }
          
          .comparison-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          
          .comparison-info {
            font-size: 14px;
            color: #666;
            margin-top: 4px;
          }
          
          .comparison-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
          }
          
          .comparison-label {
            font-size: 16px;
            margin-bottom: 8px;
            color: #444;
          }
          
          .comparison-value {
            font-size: 22px;
            font-weight: bold;
          }
          
          .comparison-arrow {
            font-size: 24px;
            margin: 0 16px;
            color: black;
          }
          
          .improvement-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 8px;
          }
          
          .improvement-value {
            font-size: 16px;
            font-weight: bold;
            color: #4cb648;
          }
          
          .improvement-text {
            font-size: 16px;
            color: #444;
            margin-left: 4px;
          }
          
          .energy-bars-container {
            width: 100%;
            position: relative;
            margin-bottom: 32px;
          }
          
          .energy-bar-container {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            position: relative;
            height: 40px;
          }
          
          .energy-bar {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0 16px;
            height: 100%;
            color: white;
            font-weight: bold;
            position: relative;
            border-radius: 4px 0 0 4px;
            transition: transform 0.3s ease;
          }
          
          .energy-bar-arrow {
            position: absolute;
            right: -12px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 20px solid transparent;
            border-bottom: 20px solid transparent;
            border-left: 12px solid;
            pointer-events: none;
          }
          
          .energy-bar.current {
            transform: scale(1.05);
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .energy-bar.previous {
            border: 2px dashed rgba(0, 0, 0, 0.3);
            box-sizing: border-box;
            opacity: 0.7;
          }
          
          .energy-label-text {
            font-size: 20px;
            font-weight: bold;
          }
          
          .energy-current-badge {
            position: absolute;
            right: -24px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 54px;
            height: 54px;
            background-color: black;
            color: white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            z-index: 20;
          }
          
          .energy-previous-badge {
            position: absolute;
            right: -24px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: #777;
            color: white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            opacity: 0.7;
            z-index: 15;
          }
          
          .energy-badge-text {
            font-size: 22px;
            font-weight: bold;
          }
          
          .energy-previous-badge-text {
            font-size: 18px;
            font-weight: bold;
          }
          
          .energy-result-container {
            width: 100%;
            background-color: #f5f5f5;
            padding: 16px;
            border-radius: 6px;
          }
          
          
          .energy-result-value {
            text-align: center;
            font-size: 36px;
            font-weight: bold;
            padding: 8px 0;
            border-radius: 6px;
          }
          
          .energy-result-description {
            text-align: center;
            color: #666;
            margin-top: 8px;
          }
          
          .improvement-label {
            display: inline-block;
            background-color: #4cb648;
            color: white;
            font-size: 14px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            margin-top: 12px;
          }
        `}
      </style>

      <div className="energy-label-container">
        <div className="tile-title">Energielabel</div>
        {!currentEnergyUsage ? (
          <p className="selected-measures__empty">
            Geen huidige energieverbruik gevonden
          </p>
        ) : (
          <>
            <div className="energy-info-container">
              <div className="energy-comparison">
                <div className="comparison-container">
                  <div className="comparison-item">
                    <div className="comparison-label">Label</div>
                    <div
                      className="comparison-value"
                      style={{
                        color:
                          labelColors[
                            originalLabel as keyof typeof labelColors
                          ],
                        fontSize: "40px",
                      }}
                    >
                      {originalLabel}
                    </div>
                    <div className="comparison-info">
                      {originalEnergy} kWh/m2
                    </div>
                  </div>

                  {currentEnergyUsage != newEnergy && (
                    <>
                      <div className="comparison-arrow">→</div>
                      <div className="comparison-item">
                        <div className="comparison-label">Nieuw Label</div>
                        <div
                          className="comparison-value"
                          style={{
                            color:
                              labelColors[newLabel as keyof typeof labelColors],
                            fontSize: "40px",
                          }}
                        >
                          {newLabel}
                        </div>
                        <div className="comparison-info">
                          {newEnergy.toFixed(0)} kWh/m2
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {currentEnergyUsage != newEnergy && (
                  <div className="improvement-indicator">
                    <div className="improvement-value">
                      {Math.round(
                        ((originalEnergy - newEnergy) / originalEnergy) * 100
                      )}
                      %
                    </div>

                    <div className="improvement-text">
                      verbetering in energieverbruik
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="energy-bars-container">
              {allLabels.map((ratingLabel, index) => {
                const isNewLabel = ratingLabel === newLabel;
                const isOriginalLabel = ratingLabel === originalLabel;
                // Use the fixed width for each label
                const barWidth = labelWidths[ratingLabel];
                const bgColor =
                  labelColors[ratingLabel as keyof typeof labelColors];

                return (
                  <div key={ratingLabel} className="energy-bar-container">
                    <div
                      className={`energy-bar ${isNewLabel ? "current" : ""} ${
                        isOriginalLabel && !isNewLabel ? "previous" : ""
                      }`}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: bgColor,
                        zIndex: isNewLabel ? 10 : isOriginalLabel ? 9 : 5,
                      }}
                    >
                      <span className="energy-label-text">{ratingLabel}</span>
                      <div
                        className="energy-bar-arrow"
                        style={{ borderLeftColor: bgColor }}
                      ></div>
                      {isNewLabel && (
                        <div className="energy-current-badge">
                          <span className="energy-badge-text">
                            {ratingLabel}
                          </span>
                        </div>
                      )}
                      {isOriginalLabel && !isNewLabel && (
                        <div className="energy-previous-badge">
                          <span className="energy-previous-badge-text">
                            {ratingLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EnergyLabel;
