import React from "react";
import { Shield, Headphones, Award, Users, MapPin, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1950&q=80"
            alt="About Us"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About BookYourStay
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Your trusted partner in finding the perfect accommodation
          </p>
        </div>
      </div>

      
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Founded in 2020, StayEase began with a simple mission: to make hotel booking easy, transparent, and accessible to everyone. 
                We believe that finding the perfect place to stay shouldn't be complicated or stressful.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Today, we partner with thousands of properties worldwide, from boutique hotels to luxury resorts, ensuring our users have access to the best accommodations at competitive prices.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our team of travel enthusiasts works tirelessly to curate the finest selection of properties, verify their quality, and negotiate the best rates for our customers.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
                alt="Hotel Interior"
                className="rounded-2xl shadow-xl w-full max-w-md h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

    
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer First</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in service and selection
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trust</h3>
              <p className="text-gray-600">
                Building lasting relationships through transparency
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                Continuously improving our platform and services
              </p>
            </div>
          </div>
        </div>
      </section>

   
      <section className="py-20 bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-orange-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-orange-100">Partner Hotels</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-orange-100">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.8</div>
              <div className="text-orange-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}