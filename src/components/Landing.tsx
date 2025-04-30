import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-900 text-center max-w-xl">
        Welcome to the Dashboard App
      </h1>
      <p className="mb-8 text-xl text-gray-700 text-center max-w-md">
        Please{' '}
        <Link
          to="/login"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold"
        >
          Log in
        </Link>{' '}
        to continue.
      </p>
    </div>
  );
};

export default Landing;
