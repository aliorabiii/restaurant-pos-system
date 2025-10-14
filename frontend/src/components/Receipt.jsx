import './Receipt.css';

const Receipt = ({ order, onClose, onPrint }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <h2>Receipt</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="receipt-content" id="receipt-print">
          <div className="receipt-paper">
            <div className="restaurant-info">
              <h1>🍔 RESTAURANT POS</h1>
              <p>123 Main Street</p>
              <p>Tel: (123) 456-7890</p>
            </div>

            <div className="receipt-divider">════════════════════════════</div>

            <div className="receipt-details">
              <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
              <p><strong>Order #:</strong> {order.orderNumber}</p>
              <p><strong>Cashier:</strong> {order.cashier}</p>
              <p><strong>Table:</strong> {order.tableNumber}</p>
            </div>

            <div className="receipt-divider">────────────────────────────</div>

            <div className="receipt-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="receipt-item">
                  <div className="item-line">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="item-customizations-receipt">
                      {item.customizations.map((custom, i) => (
                        <div key={i}>- {custom.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="receipt-divider">────────────────────────────</div>

            <div className="receipt-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Tax (10%):</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="total-line discount">
                  <span>Discount:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider">────────────────────────────</div>

            <div className="receipt-total">
              <div className="total-line grand-total">
                <span>TOTAL:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-info">
              <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
              {order.paymentMethod === 'cash' && order.cashReceived && (
                <>
                  <p><strong>Cash Received:</strong> ${order.cashReceived.toFixed(2)}</p>
                  <p><strong>Change:</strong> ${order.change.toFixed(2)}</p>
                </>
              )}
            </div>

            <div className="receipt-divider">════════════════════════════</div>

            <div className="receipt-footer">
              <p>Thank You! Come Again</p>
              <p>★★★★★</p>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="print-btn" onClick={onPrint}>
            🖨️ Print Receipt
          </button>
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;