import { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ total, paymentMethod, onConfirm, onCancel }) => {
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  };

  const handleNumberPad = (value) => {
    if (value === 'clear') {
      setCashReceived('');
    } else if (value === 'backspace') {
      setCashReceived(prev => prev.slice(0, -1));
    } else {
      setCashReceived(prev => prev + value);
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0;
      if (received < total) {
        alert('Insufficient cash amount!');
        return;
      }
    }

    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onConfirm({
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
        change: paymentMethod === 'cash' ? calculateChange() : 0
      });
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="payment-overlay" onClick={onCancel}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          <h2>
            {paymentMethod === 'cash' ? '💵 Cash Payment' : '💳 Card Payment'}
          </h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="payment-content">
          <div className="amount-display">
            <div className="label">Total Amount:</div>
            <div className="amount">${total.toFixed(2)}</div>
          </div>

          {paymentMethod === 'cash' ? (
            <>
              <div className="cash-input-section">
                <label>Cash Received:</label>
                <input
                  type="text"
                  value={cashReceived}
                  readOnly
                  placeholder="0.00"
                  className="cash-input"
                />
              </div>

              <div className="number-pad">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '←'].map((num) => (
                  <button
                    key={num}
                    className="num-btn"
                    onClick={() => handleNumberPad(num === '←' ? 'backspace' : num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {cashReceived && (
                <div className="change-display">
                  <div className="label">Change:</div>
                  <div className="change-amount">
                    ${calculateChange().toFixed(2)}
                  </div>
                </div>
              )}

              <div className="quick-amounts">
                <button onClick={() => setCashReceived('10')}>$10</button>
                <button onClick={() => setCashReceived('20')}>$20</button>
                <button onClick={() => setCashReceived('50')}>$50</button>
                <button onClick={() => setCashReceived('100')}>$100</button>
              </div>
            </>
          ) : (
            <div className="card-payment-info">
              <p>💳 Please insert or tap the card</p>
              <div className="card-animation">
                <div className="card-icon">💳</div>
              </div>
              <p className="card-instruction">
                Waiting for card reader...
              </p>
            </div>
          )}
        </div>

        <div className="payment-footer">
          <button className="cancel-payment-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="confirm-payment-btn"
            onClick={handleConfirmPayment}
            disabled={processing || (paymentMethod === 'cash' && parseFloat(cashReceived) < total)}
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;