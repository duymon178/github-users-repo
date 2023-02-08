import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function App() {
  const navigate = useNavigate();

  const user = window.localStorage.getItem("GITHUB_USERS_ID");

  function handlelLogout() {
    window.localStorage.removeItem("GITHUB_USERS_ID");
    navigate("/login");
  }

  return (
    <div className="App">
      <nav className="Nav">
        <div className="container">
          <div className="NavContent">
            <button
              onClick={() => {
                navigate("/");
              }}>
              Home
            </button>
            {user && (
              <>
                <div className="Profile">
                  <button
                    onClick={() => {
                      navigate("/profile");
                    }}>
                    +84898989327
                  </button>
                </div>
                <button className="Button" onClick={handlelLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="Main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
