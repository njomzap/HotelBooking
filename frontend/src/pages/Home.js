import React from "react";
import { Link } from "react-router-dom";
import { Shield, Headphones, Award, ArrowRight } from "lucide-react";
import HeroSearchBanner from "../components/HeroSearchBanner";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSearchBanner />

      
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StayEase
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make hotel booking simple, secure, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Booking</h3>
              <p className="text-gray-600">
                Your data is protected with industry-leading security standards
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Our team is always here to help you with any questions
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find the best deals and prices on thousands of properties
              </p>
            </div>
          </div>
        </div>
      </section>

     
      <section className="py-20 bg-orange-500 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Book Your Next Stay?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers and discover your perfect accommodation
          </p>
          <Link to="/hotels">
            <button className="bg-white text-orange-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto">
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
