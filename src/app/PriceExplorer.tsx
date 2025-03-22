// components/PriceExplorer.tsx
"use client";

import { useState, useMemo } from "react";

type Price = {
  id: number;
  city: string;
  country: string;
  priceCzk: string;
  continent: string;
  createdAt: string | null;
};

type PriceExplorerProps = {
  initialData: Price[];
};

export default function PriceExplorer({ initialData }: PriceExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Price;
    direction: "ascending" | "descending";
  }>({ key: 'priceCzk', direction: "ascending" }); // Default sort by price ascending

  // Extract unique continents for filters
  const continents = useMemo(() => {
    const uniqueContinents = [...new Set(initialData.map(price => price.continent))];
    return uniqueContinents.sort();
  }, [initialData]);

  // Extract countries based on selected continent
  const countries = useMemo(() => {
    let filteredPrices = initialData;
    if (selectedContinent) {
      filteredPrices = filteredPrices.filter(price => price.continent === selectedContinent);
    }
    const uniqueCountries = [...new Set(filteredPrices.map(price => price.country))];
    return uniqueCountries.sort();
  }, [initialData, selectedContinent]);

  // Handle sorting
  const handleSort = (key: keyof Price) => {
    const direction = sortConfig.key === key && sortConfig.direction === "ascending" 
      ? "descending" 
      : "ascending";
    setSortConfig({ key, direction });
  };

  // Filter and sort the data
  const filteredAndSortedPrices = useMemo(() => {
    let result = [...initialData];
    
    // Apply continent filter
    if (selectedContinent) {
      result = result.filter(price => price.continent === selectedContinent);
    }
    
    // Apply country filter
    if (selectedCountry) {
      result = result.filter(price => price.country === selectedCountry);
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(price => 
        price.city.toLowerCase().includes(searchLower) ||
        price.country.toLowerCase().includes(searchLower) ||
        price.continent.toLowerCase().includes(searchLower)
      );
    }
    
    // Remove duplicates (keeping only lowest price for each city)
    if (removeDuplicates) {
      const cityMap = new Map<string, Price>();
      
      result.forEach(price => {
        const existingPrice = cityMap.get(price.city);
        const currentPrice = parseFloat(price.priceCzk);
        
        if (!existingPrice || currentPrice < parseFloat(existingPrice.priceCzk)) {
          cityMap.set(price.city, price);
        }
      });
      
      result = Array.from(cityMap.values());
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Special handling for price (convert to number)
        if (sortConfig.key === 'priceCzk') {
          aValue = parseFloat(a.priceCzk);
          bValue = parseFloat(b.priceCzk);
        }
        
        if (aValue !== null && bValue !== null && aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue !== null && bValue !== null && aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [initialData, selectedContinent, selectedCountry, searchTerm, sortConfig, removeDuplicates]);

  // Get the appropriate arrow for a column
  const getSortArrow = (key: keyof Price) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="bg-black text-white p-4">
      {/* Filter section - styled to match screenshot */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <div className="mb-2 text-sm">Search</div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city, country..."
            className="w-full p-2 bg-black border border-gray-700 rounded text-white"
          />
        </div>
        
        <div>
          <div className="mb-2 text-sm">Continent</div>
          <select
            value={selectedContinent}
            onChange={(e) => {
              setSelectedContinent(e.target.value);
              setSelectedCountry(""); // Reset country when continent changes
            }}
            className="w-full p-2 bg-black border border-gray-700 rounded text-white appearance-none"
          >
            <option value="">All Continents</option>
            {continents.map(continent => (
              <option key={continent} value={continent}>{continent}</option>
            ))}
          </select>
        </div>
        
        <div>
          <div className="mb-2 text-sm">Country</div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-2 bg-black border border-gray-700 rounded text-white appearance-none"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => {
              setSelectedContinent("");
              setSelectedCountry("");
              setSearchTerm("");
              setRemoveDuplicates(false);
              setSortConfig({ key: 'priceCzk', direction: "ascending" }); // Reset to default sort
            }}
            className="p-2 bg-white text-black rounded w-full"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Duplicate toggle */}
      <div className="flex items-center mb-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={removeDuplicates}
              onChange={() => setRemoveDuplicates(!removeDuplicates)}
            />
            <div className={`block w-10 h-6 rounded-full transition ${removeDuplicates ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${removeDuplicates ? 'translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm">Show only lowest price per city</div>
        </label>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-gray-400">
        <p>Showing {filteredAndSortedPrices.length} of {initialData.length} results</p>
      </div>
      
      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th 
                className="p-3 text-left border-b border-gray-700 cursor-pointer" 
                onClick={() => handleSort('city')}
              >
                City {getSortArrow('city')}
              </th>
              <th 
                className="p-3 text-left border-b border-gray-700 cursor-pointer" 
                onClick={() => handleSort('country')}
              >
                Country {getSortArrow('country')}
              </th>
              <th 
                className="p-3 text-left border-b border-gray-700 cursor-pointer" 
                onClick={() => handleSort('continent')}
              >
                Continent {getSortArrow('continent')}
              </th>
              <th 
                className="p-3 text-center border-b border-gray-700 cursor-pointer bg-gray-950" 
                onClick={() => handleSort('priceCzk')}
              >
                Price (CZK) {getSortArrow('priceCzk')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPrices.map((price, index) => (
              <tr 
                key={price.id} 
                className={`hover:bg-gray-900 ${index % 2 === 0 ? 'bg-black' : 'bg-gray-900'}`}
              >
                <td className="p-3 border-b border-gray-800">{price.city}</td>
                <td className="p-3 border-b border-gray-800">{price.country}</td>
                <td className="p-3 border-b border-gray-800">{price.continent}</td>
                <td className="p-3 border-b border-gray-800 text-center">{price.priceCzk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
