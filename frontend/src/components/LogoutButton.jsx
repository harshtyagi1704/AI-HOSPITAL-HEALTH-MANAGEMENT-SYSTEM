import { useNavigate } from "react-router-dom";

function LogoutButton() {

  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}

export default LogoutButton;