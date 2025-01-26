'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

interface Property {
  id: string;
  name: string;
  price: string;
  address: string;
  details: string;
  images: string[];
  company_url: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export default function Sidebar() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 p-8 fixed left-0 shadow-lg overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            HomeHub
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">Find your perfect property</p>
      </div>
      
      <div className="mb-8">
        <div className="relative">
          <input 
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties..."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-20">
        {loading ? (
          <div className="text-center py-4">Loading properties...</div>
        ) : (
          filteredProperties.map((property) => (
            <div
              key={property.id}
              className="p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-all bg-white hover:shadow-md"
            >
              {property.images && property.images[0] && (
                <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
              <p className="text-blue-600 font-bold mt-1">{property.price}</p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{property.address}</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={property.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 