import React from "react";
import "./TableBar.css";

const TableBar = ({ tables, selectedTable, onTableSelect, onNewOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "occupied":
        return "#22c55e"; // green for occupied
      case "waiting_payment":
        return "#eab308"; // yellow for waiting payment
      case "reserved":
        return "#f97316"; // orange for reserved
      case "empty":
      default:
        return "#ef4444"; // RED for empty
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "occupied":
        return "Occupied";
      case "waiting_payment":
        return "Payment";
      case "reserved":
        return "Reserved";
      case "empty":
      default:
        return "Empty";
    }
  };

  return (
    <div className="table-bar">
      <div className="table-bar-header">
        <h3>Tables</h3>
        <button className="new-order-btn" onClick={onNewOrder}>
          + New Order
        </button>
      </div>

      <div className="tables-container">
        <div className="tables-scroll">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`table-square ${
                selectedTable?._id === table._id ? "selected" : ""
              }`}
              onClick={() => onTableSelect(table)}
            >
              <div
                className="table-status-indicator"
                style={{ backgroundColor: getStatusColor(table.status) }}
              ></div>
              <div className="table-number">{table.number}</div>
              <div className="table-capacity">{table.capacity} seats</div>
              <div className="table-status-text">
                {getStatusText(table.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableBar;
