// frontend/src/components/clerk/SelectedItemsPanel.jsx
import React, { useState, useEffect } from "react";
import { FaDollarSign, FaEdit, FaTrash, FaTruck } from "react-icons/fa";

const SelectedItemsPanel = ({
  selectedItems,
  onUpdateItem,
  onRemoveItem,
  paymentMethod,
  onPaymentMethodChange,
  onSaveOrder,
  selectedTable,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [orderType, setOrderType] = useState("inside");
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  // Reset states when table changes
  useEffect(() => {
    setTipAmount("");
    setOrderType("inside");
    setDeliveryCost(0);
    setDeliveryInfo({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    });
  }, [selectedTable?._id]);

  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => calculateSubtotal() * 0.11;
  const calculateDeliveryTotal = () => parseFloat(deliveryCost || 0);
  const calculateTotal = () =>
    calculateSubtotal() +
    calculateTax() +
    calculateDeliveryTotal() +
    parseFloat(tipAmount || 0);

  const getOrderNumber = () => `ORD-${Date.now().toString().slice(-6)}`;

  const getItemDisplayName = (item) => {
    return item.variant
      ? `${item.product.name} (${item.variant.size})`
      : item.product.name;
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setTempQuantity(item.quantity);
  };

  const handleTempQuantityChange = (change) => {
    const newQuantity = tempQuantity + change;
    if (newQuantity >= 1) setTempQuantity(newQuantity);
  };

  const handleSaveChanges = () => {
    if (editingItem && tempQuantity !== editingItem.quantity) {
      onUpdateItem(editingItem.id, { quantity: tempQuantity });
    }
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setTempQuantity(1);
  };

  const handleTipClick = () => {
    setShowTipModal(true);
  };

  const handleTipSave = () => {
    setShowTipModal(false);
  };

  const handleTipCancel = () => {
    setShowTipModal(false);
  };

  const handleQuickTip = (amount) => {
    setTipAmount(amount.toString());
  };

  const handleCustomTip = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setTipAmount(value);
    }
  };

  const handleOrderTypeChange = (e) => {
    const newOrderType = e.target.value;
    setOrderType(newOrderType);

    if (newOrderType === "delivery") {
      setShowDeliveryModal(true);
    } else {
      // Reset delivery cost when switching to non-delivery
      setDeliveryCost(0);
    }
  };

  const handleDeliveryInfoChange = (field, value) => {
    setDeliveryInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeliveryCostChange = (value) => {
    // Allow empty string or valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDeliveryCost(value);
    }
  };

  const handleDeliverySave = () => {
    setShowDeliveryModal(false);
  };

  const handleDeliveryCancel = () => {
    setOrderType("inside");
    setDeliveryCost(0);
    setDeliveryInfo({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    });
    setShowDeliveryModal(false);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please add items to cart before checkout");
      return;
    }

    // Validate delivery info if order type is delivery
    if (orderType === "delivery" && !selectedTable) {
      if (
        !deliveryInfo.customerName ||
        !deliveryInfo.customerPhone ||
        !deliveryInfo.customerAddress
      ) {
        alert("Please fill in all delivery information");
        setShowDeliveryModal(true);
        return;
      }
    }

    // Create base order data - ONLY SEND FIELDS THAT EXIST IN THE ORDER MODEL
    const orderData = {
      orderNumber: getOrderNumber(),
      items: selectedItems.map((item) => ({
        productId: item.product._id,
        productName: getItemDisplayName(item),
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
        subCategory: item.product.sub_category?.name || "Unknown",
      })),
      itemNames: selectedItems.map((item) => getItemDisplayName(item)),
      subCategories: [
        ...new Set(
          selectedItems.map(
            (item) => item.product.sub_category?.name || "Unknown"
          )
        ),
      ],
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      tip: parseFloat(tipAmount || 0),
      paymentMethod: paymentMethod,
      createdAt: new Date(),
      status: "completed",
      orderType: "inside", // DEFAULT TO "inside" FOR ALL ORDERS
    };

    // For delivery orders (non-table), update order type and add delivery info
    if (!selectedTable && orderType === "delivery") {
      orderData.orderType = "delivery";
      orderData.deliveryInfo = {
        ...deliveryInfo,
        deliveryCost: parseFloat(deliveryCost || 0),
      };
      orderData.deliveryTimestamps = {
        createdAt: new Date(),
      };
    }

    // DO NOT SEND tableId or tableNumber - they don't exist in the Order model

    console.log("Order data being sent:", orderData);
    onSaveOrder(orderData);

    // Reset states after order
    setTipAmount("");
    setOrderType("inside");
    setDeliveryCost(0);
    setDeliveryInfo({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    });
  };

  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: "500px" }}>
      {/* Header - Fixed */}
      <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
        <h6
          className="mb-0 fw-bold text-uppercase"
          style={{ fontSize: "0.65rem" }}
        >
          Current Order
        </h6>
        <span
          className="badge bg-primary"
          style={{ fontSize: "0.6rem", padding: "2px 6px" }}
        >
          {selectedItems.length}
        </span>
      </div>

      {/* Table Information - Fixed */}
      {selectedTable && (
        <div
          className="alert alert-info py-1 mb-1"
          style={{ fontSize: "0.65rem" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <strong>Table {selectedTable.number}</strong>
              <span
                className={`badge ${
                  selectedTable.status === "occupied"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
                style={{ fontSize: "0.55rem" }}
              >
                {selectedTable.status === "occupied" ? "Occupied" : "Empty"}
              </span>
            </div>
            {selectedTable.status === "occupied" &&
              selectedItems.length > 0 && (
                <small className="text-success">
                  💾 {selectedItems.length} items
                </small>
              )}
          </div>
        </div>
      )}

      {/* Scrollable Items Area */}
      <div
        className="flex-grow-1 overflow-auto mb-1"
        style={{ maxHeight: "320px", minHeight: "100px" }}
      >
        {selectedItems.length === 0 ? (
          <div className="text-center text-muted py-4">
            <div className="mb-1" style={{ fontSize: "1.5rem" }}>
              🛒
            </div>
            <p className="mb-0" style={{ fontSize: "0.65rem" }}>
              No items yet
            </p>
            {selectedTable && (
              <small className="text-muted" style={{ fontSize: "0.6rem" }}>
                Add items to Table {selectedTable.number}
              </small>
            )}
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="list-group-item px-1 py-1 border-bottom"
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 me-1" style={{ minWidth: 0 }}>
                    <div
                      className="fw-semibold text-truncate"
                      style={{ fontSize: "0.7rem" }}
                      title={getItemDisplayName(item)}
                    >
                      {getItemDisplayName(item)}
                    </div>
                    <div
                      className="d-flex justify-content-between align-items-center mt-1"
                      style={{ fontSize: "0.6rem" }}
                    >
                      <span className="text-muted">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-muted mx-2">×</span>
                      <span className="text-muted">{item.quantity}</span>
                      <span className="text-muted mx-2">=</span>
                      <span className="fw-bold text-dark">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="btn btn-outline-primary p-0"
                      title="Edit item"
                      style={{
                        fontSize: "0.5rem",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaEdit size={8} />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="btn btn-outline-danger p-0"
                      title="Remove item"
                      style={{
                        fontSize: "0.5rem",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaTrash size={8} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Section - Always Visible */}
      <div className="border-top pt-1" style={{ flexShrink: 0 }}>
        {/* Totals */}
        {selectedItems.length > 0 && (
          <div className="mb-1">
            <div
              className="d-flex justify-content-between py-1"
              style={{ fontSize: "0.65rem" }}
            >
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div
              className="d-flex justify-content-between py-1"
              style={{ fontSize: "0.65rem" }}
            >
              <span>Tax (11%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>

            {/* Delivery Cost Display */}
            {orderType === "delivery" && deliveryCost > 0 && (
              <div
                className="d-flex justify-content-between py-1 text-warning"
                style={{ fontSize: "0.65rem" }}
              >
                <span>Delivery Cost:</span>
                <span>+${parseFloat(deliveryCost || 0).toFixed(2)}</span>
              </div>
            )}

            {tipAmount > 0 && (
              <div
                className="d-flex justify-content-between py-1 text-success"
                style={{ fontSize: "0.65rem" }}
              >
                <span>Tip:</span>
                <span>+${parseFloat(tipAmount).toFixed(2)}</span>
              </div>
            )}
            <div
              className="d-flex justify-content-between fw-bold border-top pt-1 mt-1"
              style={{ fontSize: "0.7rem" }}
            >
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Order Type - Only show if NOT a table order */}
        {!selectedTable && (
          <div className="mb-1">
            <label
              className="form-label fw-semibold mb-0"
              style={{ fontSize: "0.65rem" }}
            >
              Order Type
            </label>
            <select
              value={orderType}
              onChange={handleOrderTypeChange}
              className="form-select form-select-sm p-1"
              style={{ fontSize: "0.65rem" }}
            >
              <option value="inside">Inside</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        )}

        {/* Tip Input */}
        <div className="mb-1">
          <label
            className="form-label fw-semibold mb-0"
            style={{ fontSize: "0.65rem" }}
          >
            Tip (Optional)
          </label>
          <div className="input-group input-group-sm">
            <span
              className="input-group-text p-1"
              style={{ fontSize: "0.6rem" }}
            >
              <FaDollarSign size={9} />
            </span>
            <input
              type="text"
              className="form-control p-1"
              placeholder="Enter tip amount"
              value={tipAmount}
              onClick={handleTipClick}
              readOnly
              style={{ fontSize: "0.65rem" }}
            />
            <button
              className="btn btn-outline-secondary p-1"
              type="button"
              onClick={handleTipClick}
              style={{ fontSize: "0.65rem" }}
            >
              💰
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-1">
          <label
            className="form-label fw-semibold mb-0"
            style={{ fontSize: "0.65rem" }}
          >
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="form-select form-select-sm p-1"
            style={{ fontSize: "0.65rem" }}
          >
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="mobile">Mobile Pay</option>
          </select>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          className="btn btn-primary w-100 mb-1 py-1"
          disabled={selectedItems.length === 0}
          style={{ fontSize: "0.7rem" }}
        >
          {selectedTable ? "Complete Sale " : "Complete Sale"}
        </button>

        {selectedTable && (
          <div className="text-center">
            <small className="text-muted" style={{ fontSize: "0.55rem" }}>
               Linked to Table {selectedTable.number}
            </small>
          </div>
        )}
      </div>

      {/* Edit Quantity Modal */}
      {editingItem && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header py-1">
                <h6 className="modal-title" style={{ fontSize: "0.7rem" }}>
                  Edit {getItemDisplayName(editingItem)}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  onClick={handleCancelEdit}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Quantity
                  </label>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <button
                      onClick={() => handleTempQuantityChange(-1)}
                      disabled={tempQuantity <= 1}
                      className="btn btn-outline-primary btn-sm p-1"
                      style={{
                        fontSize: "0.6rem",
                        width: "30px",
                        height: "30px",
                      }}
                    >
                      -
                    </button>
                    <span
                      className="fw-bold"
                      style={{ fontSize: "0.8rem", minWidth: "30px" }}
                    >
                      {tempQuantity}
                    </span>
                    <button
                      onClick={() => handleTempQuantityChange(1)}
                      className="btn btn-outline-primary btn-sm p-1"
                      style={{
                        fontSize: "0.6rem",
                        width: "30px",
                        height: "30px",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="border-top pt-2">
                  <div
                    className="d-flex justify-content-between"
                    style={{ fontSize: "0.65rem" }}
                  >
                    <span>Price each:</span>
                    <span>${editingItem.price.toFixed(2)}</span>
                  </div>
                  <div
                    className="d-flex justify-content-between fw-bold mt-1 pt-1 border-top"
                    style={{ fontSize: "0.7rem" }}
                  >
                    <span>Total:</span>
                    <span>
                      ${(editingItem.price * tempQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer py-1">
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header py-1">
                <h6 className="modal-title" style={{ fontSize: "0.7rem" }}>
                  Add Tip
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  onClick={handleTipCancel}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Tip Amount ($)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm p-1"
                    placeholder="0"
                    value={tipAmount}
                    onChange={handleCustomTip}
                    inputMode="numeric"
                    style={{ fontSize: "0.65rem" }}
                  />
                </div>

                {/* Quick Tip Buttons */}
                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Quick Tips
                  </label>
                  <div className="d-grid gap-1">
                    <div className="row g-1">
                      <div className="col-6">
                        <button
                          type="button"
                          className={`btn ${
                            tipAmount === "3"
                              ? "btn-primary"
                              : "btn-outline-primary"
                          } btn-sm w-100 p-1`}
                          onClick={() => handleQuickTip(3)}
                          style={{ fontSize: "0.65rem" }}
                        >
                          $3
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className={`btn ${
                            tipAmount === "5"
                              ? "btn-primary"
                              : "btn-outline-primary"
                          } btn-sm w-100 p-1`}
                          onClick={() => handleQuickTip(5)}
                          style={{ fontSize: "0.65rem" }}
                        >
                          $5
                        </button>
                      </div>
                    </div>
                    <div className="row g-1 mt-1">
                      <div className="col-6">
                        <button
                          type="button"
                          className={`btn ${
                            tipAmount === "10"
                              ? "btn-primary"
                              : "btn-outline-primary"
                          } btn-sm w-100 p-1`}
                          onClick={() => handleQuickTip(10)}
                          style={{ fontSize: "0.65rem" }}
                        >
                          $10
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm w-100 p-1"
                          onClick={() => handleQuickTip(0)}
                          style={{ fontSize: "0.65rem" }}
                        >
                          No Tip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {tipAmount > 0 && (
                  <div className="alert alert-success py-1 mb-0">
                    <div
                      className="d-flex justify-content-between"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span>Tip Amount:</span>
                      <strong>${parseFloat(tipAmount).toFixed(2)}</strong>
                    </div>
                    <div
                      className="d-flex justify-content-between mt-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span>Order Total:</span>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer py-1">
                <button
                  onClick={handleTipCancel}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTipSave}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Info Modal */}
      {showDeliveryModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header py-1">
                <h6 className="modal-title" style={{ fontSize: "0.7rem" }}>
                  <FaTruck className="me-1" size={12} />
                  Delivery Information
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  onClick={handleDeliveryCancel}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm p-1"
                    placeholder="Enter customer name"
                    value={deliveryInfo.customerName}
                    onChange={(e) =>
                      handleDeliveryInfoChange("customerName", e.target.value)
                    }
                    style={{ fontSize: "0.65rem" }}
                  />
                </div>

                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm p-1"
                    placeholder="Enter phone number"
                    value={deliveryInfo.customerPhone}
                    onChange={(e) =>
                      handleDeliveryInfoChange("customerPhone", e.target.value)
                    }
                    style={{ fontSize: "0.65rem" }}
                  />
                </div>

                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Delivery Address *
                  </label>
                  <textarea
                    className="form-control form-control-sm p-1"
                    placeholder="Enter full delivery address"
                    value={deliveryInfo.customerAddress}
                    onChange={(e) =>
                      handleDeliveryInfoChange(
                        "customerAddress",
                        e.target.value
                      )
                    }
                    rows="3"
                    style={{ fontSize: "0.65rem", resize: "none" }}
                  />
                </div>

                {/* Add Delivery Cost Input */}
                <div className="mb-2">
                  <label
                    className="form-label fw-semibold mb-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Delivery Cost ($)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm p-1"
                    placeholder="0.00"
                    value={deliveryCost}
                    onChange={(e) => handleDeliveryCostChange(e.target.value)}
                    inputMode="numeric"
                    style={{ fontSize: "0.65rem" }}
                  />
                </div>

                {/* Show updated total preview */}
                {deliveryCost > 0 && (
                  <div className="alert alert-warning py-1 mb-0">
                    <div
                      className="d-flex justify-content-between"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span>Delivery Cost:</span>
                      <strong>
                        +${parseFloat(deliveryCost || 0).toFixed(2)}
                      </strong>
                    </div>
                    <div
                      className="d-flex justify-content-between mt-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span>New Total:</span>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                <div className="alert alert-info py-1 mb-0 mt-2">
                  <small style={{ fontSize: "0.6rem" }}>
                    * All fields are required for delivery orders
                  </small>
                </div>
              </div>
              <div className="modal-footer py-1">
                <button
                  onClick={handleDeliveryCancel}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeliverySave}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.65rem" }}
                  disabled={
                    !deliveryInfo.customerName ||
                    !deliveryInfo.customerPhone ||
                    !deliveryInfo.customerAddress
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedItemsPanel;
