import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="Toggle dark mode"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.35)",
        background: "rgba(107, 11, 11, 0.1)",
        color: "white",
        cursor: "pointer",
        marginTop: "10px",
      }}
    >
      {theme === "dark" ? <FaSun /> : <FaMoon />}
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default ThemeToggle;
