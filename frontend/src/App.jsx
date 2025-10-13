import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>🍔 Restaurant POS System</h1>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to Cashier Dashboard</h2>
      <p>MERN Stack is ready! ✅</p>
    </div>
  );
}

export default App;