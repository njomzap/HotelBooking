import React from "react";
import { Link } from "react-router-dom";


export default function HomePage() {
  return (
    <div className="w-full">

      {/* Hero Section */}
      <div className="relative w-full h-[75vh]">
        <img
          src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80"
          alt="Hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="max-w-2xl mb-8 text-lg">
            Discover amazing hotels and resorts worldwide. Book with confidence
            and enjoy unforgettable experiences.
          </p>
          <Link to="/hotels">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg transition">
              Browse Hotels
            </button>
          </Link>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl font-semibold mb-3 text-gray-800">
            Why Choose StayEase
          </h2>
          <p className="text-gray-600">
            We make hotel booking simple, secure, and rewarding
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="bg-white shadow-md rounded-2xl p-8 text-center">
            <img
              src="/images/secure.png"
              alt="Secure Booking"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
            <p className="text-gray-600">
              Your data is protected with industry-leading security standards
            </p>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-8 text-center">
            <img
              src="/images/support.png"
              alt="24/7 Support"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our team is always here to help you with any questions
            </p>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-8 text-center">
            <img
              src="/images/award.png"
              alt="Best Price Guarantee"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-gray-600">
              Find the best deals and prices on thousands of properties
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Ready to Book Your Next Stay?
        </h2>
        <p className="max-w-2xl mx-auto mb-8">
          Join thousands of satisfied travelers and discover your perfect accommodation
        </p>
        <button className="bg-white text-orange-600 font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition">
          Start Exploring
        </button>
      </section>


    </div>
  );
}
