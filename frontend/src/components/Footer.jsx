import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <footer className="bg-[#1f2a37] text-gray-300 py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:items-start md:justify-between">

        {/* Column 1 — Logo & Description */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg">
              <img
                src="/images/logo.png"
                alt="BookYourStay Logo"
                className="w-8 h-8 object-cover rounded-lg"
              />
            </div>
            <h2 className="text-lg font-semibold text-white">BookYourStay</h2>
          </div>
          <p className="text-sm leading-relaxed">
            Your trusted partner for comfortable and memorable stays worldwide.
          </p>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
  <h3 className="text-white font-semibold mb-3">Quick Links</h3>
  <ul className="flex flex-col gap-2 text-sm">
    <li>
      <Link to="/" className="hover:text-orange-400 transition">Home</Link>
    </li>

    {!isLoggedIn && (
      <>
        <li>
          <Link to="/hotels" className="hover:text-orange-400 transition">Hotels</Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-orange-400 transition">About Us</Link>
        </li>
      </>
    )}

    {isLoggedIn && (
      <>
        <li>
          <Link to="/hotels" className="hover:text-orange-400 transition">Hotels</Link>
        </li>
        <li>
          <Link to="/user/bookings" className="hover:text-orange-400 transition">Bookings</Link>
        </li>
        <li>
          <Link to="/user/profile" className="hover:text-orange-400 transition">Profile</Link>
        </li>
      </>
    )}
  </ul>
</div>


        {/* Column 3 — Contact */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2"><Phone size={12} /> +(383) 49-123-456</li>
            <li className="flex items-center gap-2"><Mail size={16} /> info@bookyourstay.com</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> 10000 Prishtinë, Kosovë</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-400">
        © 2025 BookYourStay. All rights reserved.
      </div>
    </footer>
  );
}

