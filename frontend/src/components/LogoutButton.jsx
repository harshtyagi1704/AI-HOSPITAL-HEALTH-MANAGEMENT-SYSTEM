import { useNavigate } from "react-router-dom";

function LogoutButton() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}

export default LogoutButton;