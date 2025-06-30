import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * 物資状況一覧＋編集UI
 */
const ShelterSupplies = ({ shelterId, supplies = [], onUpdate }) => {
  const [localSupplies, setLocalSupplies] = useState(supplies);

  const handleChange = (idx, field, value) => {
    const updated = localSupplies.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s,
    );
    setLocalSupplies(updated);
    onUpdate && onUpdate(updated);
  };

  return (
    <div className="shelter-supplies">
      <table>
        <thead>
          <tr>
            <th>物資名</th>
            <th>数量</th>
          </tr>
        </thead>
        <tbody>
          {localSupplies.map((s, idx) => (
            <tr key={idx}>
              <td>
                <input
                  value={s.item}
                  onChange={(e) => handleChange(idx, "item", e.target.value)}
                  disabled={!onUpdate}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={s.quantity}
                  onChange={(e) =>
                    handleChange(idx, "quantity", e.target.value)
                  }
                  disabled={!onUpdate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ShelterSupplies.propTypes = {
  shelterId: PropTypes.string.isRequired,
  supplies: PropTypes.array,
  onUpdate: PropTypes.func,
};

export default ShelterSupplies;
