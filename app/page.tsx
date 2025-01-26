'use client';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase/config';
import Sidebar from './components/Sidebar';

interface Property {
  id: string;
  name: string;
  price: string;
  address: string;
  details: string;
  images: string[];
  company_url: string;
  url: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const propertiesRef = ref(database, 'properties');
    
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const propertiesList = Object.entries(data).map(([id, property]: [string, any]) => ({
          id,
          ...property
        }));
        setProperties(propertiesList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />
      <main className="ml-72 p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Featured Properties
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Discover premium real estate opportunities</p>
          </header>

          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  {property.images && property.images[0] && (
                    <div className="relative h-48">
                      <img 
                        src={property.images[0]} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2">{property.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.address}</p>
                    <p className="text-blue-600 font-bold text-lg mb-4">{property.price}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{property.details}</p>
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 