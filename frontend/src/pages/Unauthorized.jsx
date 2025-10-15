import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;