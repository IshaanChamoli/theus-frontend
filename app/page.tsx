'use client';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase/config';
import Sidebar, { companySelectEvent } from './components/Sidebar';

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

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyModal = ({ property, onClose }: PropertyModalProps) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{property.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {property.images && property.images.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`${property.name} - Image ${index + 1}`}
                className="w-64 h-48 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-2xl font-bold text-blue-600">{property.price}</p>
          <p className="text-gray-600">{property.address}</p>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{property.details}</p>
          </div>
          <div className="pt-4">
            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Official 🔗
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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

    // Listen for company selection
    const handleCompanySelect = (event: any) => {
      setSelectedCompany(event.detail);
    };
    
    companySelectEvent.addEventListener('companySelect', handleCompanySelect);

    return () => {
      unsubscribe();
      companySelectEvent.removeEventListener('companySelect', handleCompanySelect);
    };
  }, []);

  const filteredProperties = selectedCompany
    ? properties.filter(property => property.company_url === selectedCompany)
    : properties;

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />
      <main className="ml-72 p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Real Estate
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {selectedCompany 
                ? `${new URL(selectedCompany).hostname.replace('www.', '')} Listings`
                : 'Listings Agent'}
            </p>
          </header>

          {loading ? (
            <div className="text-center py-12">Loading properties...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProperty(property)}
                >
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
                      onClick={e => e.stopPropagation()}
                    >
                      Official 🔗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      )}
    </div>
  );
} 