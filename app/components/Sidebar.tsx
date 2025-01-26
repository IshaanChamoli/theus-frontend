'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

interface Property {
  id: string;
  company_url: string;
}

// Create an event emitter for company selection
export const companySelectEvent = new EventTarget();

export default function Sidebar() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    const propertiesRef = ref(database, 'properties');
    
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const propertiesList = Object.entries(data).map(([id, property]: [string, any]) => ({
          id,
          company_url: property.company_url
        }));
        setProperties(propertiesList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get unique company URLs
  const uniqueCompanies = Array.from(new Set(properties.map(p => p.company_url)));

  // Function to get company name from URL
  const getCompanyName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return url;
    }
  };

  const handleCompanySelect = (companyUrl: string) => {
    const newSelected = companyUrl === selectedCompany ? null : companyUrl;
    setSelectedCompany(newSelected);
    
    // Dispatch event for main page
    const event = new CustomEvent('companySelect', { detail: newSelected });
    companySelectEvent.dispatchEvent(event);
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 p-8 fixed left-0 shadow-lg overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Real Estate
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">Listings Agent</p>
      </div>
      
      <div className="mb-8">
        <div className="relative">
          <input 
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies..."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Partner Companies
      </h2>

      <div className="flex flex-col gap-2">
        {uniqueCompanies
          .filter(url => getCompanyName(url).toLowerCase().includes(searchTerm.toLowerCase()))
          .map((companyUrl) => (
            <button
              key={companyUrl}
              onClick={() => handleCompanySelect(companyUrl)}
              className={`p-4 text-left rounded-xl transition-all
                       text-gray-700 font-medium group
                       focus:outline-none focus:ring-2 focus:ring-blue-200
                       border ${companyUrl === selectedCompany 
                         ? 'bg-blue-50 border-blue-100' 
                         : 'hover:bg-blue-50 border-transparent hover:border-blue-100'
                       }`}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize">{getCompanyName(companyUrl)}</span>
                <span className="text-sm text-gray-400">
                  ({properties.filter(p => p.company_url === companyUrl).length})
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
} 