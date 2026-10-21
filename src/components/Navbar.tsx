import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-icon">☀</span>
        <span>SkyCast</span>
      </div>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
}
