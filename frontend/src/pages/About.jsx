import React from "react";

export default function AboutPage() {
  return (
    <div className="w-full">

     
      <div className="relative w-full h-[60vh]">
        <img
          src="/images/buildings.jpg"
          alt="Hotel"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-4xl font-semibold">About BookYourStay</h1>
          <p className="text-lg mt-3 opacity-90">
            Your trusted partner in finding the perfect accomodation.
          </p>
        </div>
      </div>

     
      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Our Story</h2>

          <p className="text-gray-600s leading-relaxed mb-4">
          Founded in 2020, StayEase began with a simple mission: to make hotel booking easy, transparent, and accessible to everyone. 
          We believe that finding the perfect place to stay shouldn't be complicated or stressful. 
          </p>

          <p className="text-gray-600 leading-relaxed mb-4">
          Today, we partner with thousands of properties worldwide, from boutique hotels to luxury resorts, ensuring our users have access to the best accommodations at competitive prices
          </p>

          <p className="text-gray-600 leading-relaxed">
            Our team of travel enthusiasts works tirelessly to curate the finest selection of properties, verify their quality, and negotiate the best rates for our customers.
          </p>
        </div>

        <div className="flex justify-center">
          <img
            src="/images/hotel.jpg"
            alt="Interior"
            className="rounded-2xl shadow-xl w-1/2 h-auto object-cover"
          />
        </div>
      </section>

      
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold text-gray-800">Our values</h2>
          <p className="text-gray-600 mt-2">
            The principles that guide everything we do
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
           
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/costumer.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Costumer First</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Our customers are at the heart of everything we do
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/excellence.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Exellence</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
              We strive for excellence in service and selection
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/trust.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Trust</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
              Building lasting relationships through transparency
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/inovacioni.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Innovation</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Continuously improving our platform and services
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}