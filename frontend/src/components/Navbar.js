import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg">
            <img 
              src="/images/logo.png" 
              alt="StayEase Logo" 
              className="w-8 h-8 object-cover rounded-lg"
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">BookYourStay</h1>
        </div>

        {}
        <ul className="hidden md:flex items-center gap-10 text-gray-700 text-md">
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/">Home</Link>
          </li>
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/catalogue">Hotels</Link>
          </li>
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/about">About</Link>
          </li>
        </ul>

        {}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            to="/login" 
            className="px-4 py-2 border border-orange-500 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition"
          >
            Register
          </Link>
        </div>

        {}
        <button className="md:hidden ml-2" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {}
      {open && (
        <ul className="md:hidden bg-white shadow-md px-6 pb-4 flex flex-col gap-4 text-gray-700 text-md">
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          </li>
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/catalogue" onClick={() => setOpen(false)}>Hotels</Link>
          </li>
          <li className="hover:text-orange-500 cursor-pointer transition">
            <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          </li>
          <li className="flex flex-col gap-2 mt-2">
            <Link 
              to="/login" 
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-orange-500 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition text-center"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition text-center"
            >
              Register
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
