import { CartProvider } from './context/CartContext';
import CashierDashboard from './pages/CashierDashboard';
import './App.css';

function App() {
  return (
    <CartProvider>
      <CashierDashboard />
    </CartProvider>
  );
}

export default App;