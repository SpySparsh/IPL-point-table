import { useState, type JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar(): JSX.Element {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  const toggleMenu = (): void => {
    setIsOpen((current: boolean): boolean => !current);
  };

  return (
    <header className="navbar">
      <NavLink className="brand" to="/" onClick={closeMenu}>
        IPL Points
      </NavLink>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={isOpen ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/points-table" onClick={closeMenu}>
          Points Table
        </NavLink>
        <NavLink to="/admin" onClick={closeMenu}>
          Admin
        </NavLink>
        <NavLink to="/history" onClick={closeMenu}>
          Match History
        </NavLink>
        <NavLink to="/match-results" onClick={closeMenu}>
          Match Results
        </NavLink>
        {isAuthenticated ? (
          <button
            className="nav-button"
            type="button"
            onClick={(): void => {
              closeMenu();
              void logout();
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink to="/login" onClick={closeMenu}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}
