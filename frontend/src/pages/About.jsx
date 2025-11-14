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
          <h1 className="text-4xl font-semibold">Rreth BookYourStay</h1>
          <p className="text-lg mt-3 opacity-90">
            Partneri juaj i besuar për të gjetur akomodim perfekt.
          </p>
        </div>
      </div>

     
      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Historia Jonë</h2>

          <p className="text-gray-600s leading-relaxed mb-4">
            Zhvilluar në 2025, BookYourStay filloi me një mision të thjeshtë: rezervimi i hoteleve i lehtë, transparent dhe i qasshëm nga të gjithë.
          </p>

          <p className="text-gray-600 leading-relaxed mb-4">
            Sot, ne bashkëpunojmë me mijëra hotele në mbarë botën.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Ekipi ynë punon pa u lodhur për të ofruar zgjedhjen më të mirë të hoteleve.
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
          <h2 className="text-3xl font-semibold text-gray-800">Vlerat Tona</h2>
          <p className="text-gray-600 mt-2">
            Principet që na udhëheqin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
           
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/costumer.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Konsumatori i pari</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Klientët tanë janë zemra e çdo gjëje që ne bëjmë.
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/excellence.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Ekselenca</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Ne përpiqemi për ekselencë në shërbim dhe përzgjedhje.
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/trust.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Besimi</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Ndërtojmë marrëdhënie të qëndrueshme përmes transparencës.
              </p>
            </div>

            
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
              <img src="/images/inovacioni.png" className="w-15 mb-4" />
              <h3 className="font-semibold text-lg">Inovacioni</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Vazhdimisht përmirësojmë paltformën dhe shërbimet tona.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}