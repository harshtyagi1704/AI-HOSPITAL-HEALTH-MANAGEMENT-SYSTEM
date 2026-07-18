import { FaBell, FaMoon, FaUserCircle } from "react-icons/fa";

function Navbar() {

  const user = JSON.parse(sessionStorage.getItem("user"));

  const today = new Date().toLocaleDateString();

  return (

    <div
      style={{
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        borderRadius: "10px",
        marginBottom: "30px",
        boxShadow: "0 3px 12px rgba(0,0,0,.08)"
      }}
    >

      <div>

        <h2>
          🏥 AI Hospital Management
        </h2>

        <small>{today}</small>

      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}
      >

        <FaBell
          size={22}
          cursor="pointer"
        />

        <FaMoon
          size={22}
          cursor="pointer"
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >

          <FaUserCircle size={35} />

          <span>

            {user?.name}

          </span>

        </div>

      </div>

    </div>

  );

}

export default Navbar;