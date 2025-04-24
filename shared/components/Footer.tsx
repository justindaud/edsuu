'use client'

import { useState } from 'react'
import { Container, Grid, Text } from './ui'
import { ContactForm } from './ContactForm'
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import BlackLogo from '../logo/EDSU_Asset_Logo_Black.png'
import TBYTLogo2Black from '../logo/tbyt opt 2 black.png'
import Image from 'next/image'

const brandColors = {
  black: '#000000',
  green: '#85BAAC',
  white: '#ffffff',
  pink: '#EB008B'
}

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-[#EB008B] w-full">
        <Container className="w-full max-w-none px-4 md:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-6">
              {/* Map & Contact */}
              <div className="flex items-center gap-4">
                <a href="https://maps.app.goo.gl/E14UuV3vYpdLf3sM9" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="EDSU House Location">
                  <div className="social-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                </a>
                <button onClick={() => setIsContactModalOpen(true)} className="contact-button">
                  Tanya!?
                </button>
              </div>

              <div className="flex items-center gap-8">
                {/* Gallery Links */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-8 relative">
                    <Image
                      src={BlackLogo}
                      alt="EDSU House"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a href="https://www.instagram.com/edsu_house/" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Edsu House Instagram">
                    <div className="social-icon-wrapper">
                      <FaInstagram size={24} color="black" />
                    </div>
                  </a>
                  <a href="https://wa.me/6281818257272" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Edsu House WhatsApp">
                    <div className="social-icon-wrapper">
                      <FaWhatsapp size={24} color="black" />
                    </div>
                  </a>
                  <a href="mailto:edsu.house@gmail.com" className="social-icon-link" title="Edsu House Email" rel="noopener noreferrer">
                    <div className="social-icon-wrapper">
                      <FaEnvelope size={24} color="black" />
                    </div>
                  </a>
                </div>

                {/* Bookstore Links */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-8 relative">
                    <Image
                      src={TBYTLogo2Black}
                      alt="TokoBuKu YangTau"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a href="https://www.instagram.com/tokobukuyangtau/" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="ToKoBuKu YangTau Instagram">
                    <div className="social-icon-wrapper">
                      <FaInstagram size={24} color="black" />
                    </div>
                  </a>
                  <a href="mailto:tokobukuyangtau@gmail.com" className="social-icon-link" title="ToKoBuKu YangTau Email" rel="noopener noreferrer">
                    <div className="social-icon-wrapper">
                      <FaEnvelope size={24} color="black" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={24} color="#4b5563" />
            </button>
            <Text variant="heading" className="mb-6">Mau tanya apa 5ob?</Text>
            <ContactForm onSuccess={() => setIsContactModalOpen(false)} />
          </div>
        </div>
      )}

      <style jsx global>{`
        .social-icon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .social-icon-wrapper {
          padding: 0.5rem;
          background: transparent;
          border-radius: 0px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .social-icon-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0px;
          z-index: -1;
          animation: colorRotate 8s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .social-icon-link:hover .social-icon-wrapper {
          transform: scale(1.2) rotate(360deg);
        }

        .social-icon-link:hover .social-icon-wrapper::before {
          opacity: 1;
        }

        .contact-button {
          padding: 0.5rem 1.5rem;
          font-weight: bold;
          border-radius: 0px;
          background: transparent;
          color: black;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          z-index: 1;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-button::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0;
          z-index: -1;
          animation: colorRotate 8s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .contact-button:hover {
          transform: scale(1.2) rotate(360deg);
          color: black;
        }

        .contact-button:hover::before {
          opacity: 1;
        }

        @keyframes colorRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
} 