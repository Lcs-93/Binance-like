import React from 'react'

const Home = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to Binance-like
      </h1>
      <p className="text-gray-600">
        Start trading cryptocurrencies on our secure platform
      </p>
      <div className="mt-6">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
          Start Trading
        </button>
      </div>
    </div>
  )
}

export default Home
