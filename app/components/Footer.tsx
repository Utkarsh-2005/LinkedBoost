import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-4 mt-[50px] relative">
      <div className="max-w-7xl mx-auto flex justify-center space-x-6">
        <a
          href="https://www.linkedin.com/in/utkarsh-jha-002b23266/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/Utkarsh-2005"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          GitHub
        </a>
        <a
          href="https://www.instagram.com/utkarsh.905/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          Instagram
        </a>
        <a
          href="https://utkarshj.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          Portfolio
        </a>
      </div>
      <p className="text-center text-sm mt-4">
        © 2025 Utkarsh Jha. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
