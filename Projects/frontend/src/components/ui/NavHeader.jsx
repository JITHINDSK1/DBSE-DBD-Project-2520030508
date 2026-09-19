import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function NavHeader() {
  const { mode } = useAuth();
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      style={{
        position: 'relative',
        margin: '0 auto',
        display: 'flex',
        width: 'fit-content',
        borderRadius: '999px',
        border: '1.5px solid #000000',
        backgroundColor: '#ffffff',
        padding: '0.25rem',
        listStyle: 'none'
      }}
    >
      {mode === 'provider' || mode === 'admin' ? (
        <>
          <Tab setPosition={setPosition} to="/admin/dashboard">Admin Dashboard</Tab>
        </>
      ) : (
        <>
          <Tab setPosition={setPosition} to="/">Nexus Hyderabad</Tab>
          <Tab setPosition={setPosition} to="/book">Interactive Map</Tab>
          <Tab setPosition={setPosition} to="/bookings">My Bookings</Tab>
        </>
      )}

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({ children, setPosition, to }) => {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'block',
        cursor: 'pointer',
        padding: '0.4rem 1.25rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#ffffff',
        mixBlendMode: 'difference'
      }}
    >
      <Link to={to} style={{ color: 'inherit', display: 'block' }}>{children}</Link>
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={position}
      style={{
        position: 'absolute',
        zIndex: 0,
        height: 'calc(100% - 0.5rem)',
        borderRadius: '999px',
        backgroundColor: '#000000',
        top: '0.25rem'
      }}
    />
  );
};
