import React from 'react';
import { Link } from 'react-router-dom';

function Categories() {
  const categories = [
    { id: 'business', name: 'Business', count: 24, color: 'blue', icon: '💼' },
    { id: 'technology', name: 'Technology', count: 18, color: 'purple', icon: '💻' },
    { id: 'health', name: 'Health', count: 12, color: 'green', icon: '🏥' },
    { id: 'sports', name: 'Sports', count: 15, color: 'red', icon: '🏈' },
    { id: 'entertainment', name: 'Entertainment', count: 21, color: 'yellow', icon: '🎭' },
    { id: 'science', name: 'Science', count: 9, color: 'indigo', icon: '🔬' },
    { id: 'politics', name: 'Politics', count: 17, color: 'orange', icon: '🏛️' },
    { id: 'environment', name: 'Environment', count: 11, color: 'emerald', icon: '🌍' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="pt-20 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">News Categories</h1>
        <p className="text-gray-600">Browse news articles by your favorite categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            to={`/category/${category.id}`}
            key={category.id}
            className={`flex flex-col items-center p-6 rounded-xl border-2 hover:shadow-md transition-shadow ${colorClasses[category.color]} hover:opacity-90`}
          >
            <span className="text-4xl mb-2">{category.icon}</span>
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <span className="mt-2 px-3 py-1 bg-white bg-opacity-50 rounded-full text-sm">
              {category.count} articles
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h2>
        <p className="text-gray-600 mb-4">
          Our AI can help you find articles on any topic, even if it's not listed in our categories.
        </p>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter any topic..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-md transition-colors">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default Categories;
