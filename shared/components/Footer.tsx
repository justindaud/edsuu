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
  green: '#6EBDAF',
  white: '#ffffff',
  pink: '#EB008B'
}

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-[#EB008B] w-full">
        {/* Footer Content */}
        <Container className="w-full max-w-none px-4 md:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-6">
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
              </div>

              {/* Contact Button */}
              <div className="flex items-center gap-4">
                <button onClick={() => setIsContactModalOpen(true)} className="contact-button">
                  Tanya!?
                </button>
              </div>

              

              <div className="flex items-center gap-8">
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
              {/* Map Section */}
              <div className="relative h-[250px] w-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d988.4647811447902!2d110.38087232243927!3d-7.758182399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a592c3b456be3%3A0x78e9499afb829d42!2sEDSU%20house!5e0!3m2!1sen!2sid!4v1711460429818!5m2!1sen!2sid"
                  className="w-full h-full border-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </Container>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose size={24} color="#4b5563" />
            </button>
            <Text variant="heading" className="mb-6 text-[#EB008B] font-bold">Mau tanya apa 5ob?</Text>
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