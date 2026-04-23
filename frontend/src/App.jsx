import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <div className="flex justify-center items-center gap-8 mb-12">
          <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          <img src={reactLogo} className="h-24 w-24 animate-spin-slow" alt="React logo" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          React + Tailwind + Vite
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          A modern frontend setup with Tailwind CSS for styling.
        </p>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Get Started
          </h2>
          <p className="text-gray-600 mb-6">
            Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR.
          </p>
          <button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
          <p className="mt-6 text-gray-500">
            Click the button to increase the counter.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Tailwind CSS</h3>
            <p className="text-gray-600">
              Utility-first CSS framework for rapid UI development.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">React 19</h3>
            <p className="text-gray-600">
              Latest React version with improved performance and features.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Vite</h3>
            <p className="text-gray-600">
              Next‑generation frontend tooling for fast development and builds.
            </p>
          </div>
        </div>
        <footer className="mt-12 text-gray-500">
          <p>Frontend setup completed. Ready for development!</p>
        </footer>
      </div>
    </div>
  )
}

export default App
