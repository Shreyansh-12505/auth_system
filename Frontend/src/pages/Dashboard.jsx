import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="avatar">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2>Welcome back, {user?.username}!</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Username</span>
            <span className="value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="label">Email</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="label">User ID</span>
            <span className="value id">{user?._id}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
