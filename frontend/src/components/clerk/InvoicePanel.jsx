import React, { useState } from "react";
import "./InvoicePanel.css";

const InvoicePanel = ({ selectedItems, paymentMethod, onSaveOrder }) => {
  const [savedOrders, setSavedOrders] = useState([]);

  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.11;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getOrderNumber = () => {
    return `ORD-${Date.now().toString().slice(-6)}`;
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  const getItemDisplayName = (item) => {
    if (item.variant) {
      return `${item.product.name} (${item.variant.size})`;
    }
    return item.product.name;
  };

  const handleSaveInvoice = () => {
    const confirmed = window.confirm(
      "Are you sure you want to save this order? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    const orderData = {
      orderNumber: getOrderNumber(),
      items: selectedItems.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
        subCategory: item.product.sub_category?.name || "Unknown",
      })),
      itemNames: selectedItems.map((item) => item.product.name),
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
      paymentMethod: paymentMethod,
      createdAt: new Date(),
      status: "completed",
    };

    onSaveOrder(orderData);
    setSavedOrders((prev) => [...prev, orderData]);
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "💵 Cash";
      case "credit_card":
        return "💳 Credit Card";
      default:
        return method;
    }
  };

  return (
    <div className="invoice-panel">
      <div className="invoice-header">
        <h3>Invoice / Receipt</h3>
        <div className="order-info">
          <div className="order-number">Order: {getOrderNumber()}</div>
          <div className="order-date">{getCurrentDateTime()}</div>
          {paymentMethod && (
            <div className="payment-method">
              Payment: {getPaymentMethodText(paymentMethod)}
            </div>
          )}
        </div>
      </div>

      <div className="invoice-items">
        {selectedItems.length === 0 ? (
          <div className="empty-invoice">
            <div className="empty-icon">🧾</div>
            <p>No items in order</p>
          </div>
        ) : (
          <>
            <div className="items-header">
              <span className="item-name-header">Item</span>
              <span className="item-quantity-header">Qty</span>
              <span className="item-price-header">Price</span>
              <span className="item-total-header">Total</span>
            </div>
            {selectedItems.map((item) => (
              <div key={item.id} className="invoice-item">
                <div className="item-name">{getItemDisplayName(item)}</div>
                <div className="item-quantity">×{item.quantity}</div>
                <div className="item-price">${item.price.toFixed(2)}</div>
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="invoice-totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax (11%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="invoice-actions">
          <button onClick={handleSaveInvoice} className="save-invoice-btn">
            💾 Save to Database
          </button>
        </div>
      )}

      {/* Saved Orders History */}
      {savedOrders.length > 0 && (
        <div className="saved-orders">
          <h4>Recent Orders</h4>
          {savedOrders
            .slice(-5)
            .reverse()
            .map((order, index) => (
              <div key={index} className="saved-order">
                <div className="saved-order-header">
                  <span>{order.orderNumber}</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="saved-order-details">
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                  <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default InvoicePanel;
