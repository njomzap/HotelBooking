import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#eee' }}>
      <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
      <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
      <Link to="/register" style={{ margin: '0 10px' }}>Register</Link>
      <Link to="/hotels" style={{ margin: '0 10px' }}>Hotels</Link>
    </nav>
  );
}


