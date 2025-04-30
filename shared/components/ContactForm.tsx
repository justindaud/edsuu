'use client'

import { useState } from 'react'
import {
  Button,
  Text
} from '../components/ui'

interface ContactFormProps {
  onSuccess?: () => void
}

interface FormData {
  name: string
  email: string
  message: string
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
      onSuccess?.()
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-2">
          <Text variant="body" className="text-[#EB008B] font-bold">Nama</Text>
        </label>
        <input
          type="text"
          id="name"
          required
          className="w-full px-4 py-2 bg-white text-black border-2 border-black/10 placeholder-black/30 focus:outline-none focus:border-black transition-colors"
          placeholder="Nama kamu 5iapa?"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-2">
          <Text variant="body" className="text-[#EB008B] font-bold">3mail</Text>
        </label>
        <input
          type="email"
          id="email"
          required
          className="w-full px-4 py-2 bg-white text-black border-2 border-black/10 placeholder-black/30 focus:outline-none focus:border-black transition-colors"
          placeholder="3mail kamu dong!"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="message" className="block mb-2">
          <Text variant="body" className="text-[#EB008B] font-bold">Kritik 5aran P3rtanyaan</Text>
        </label>
        <textarea
          id="message"
          required
          rows={4}
          className="w-full px-4 py-2 bg-white text-black border-2 border-black/10 placeholder-black/30 focus:outline-none focus:border-black transition-colors resize-none"
          placeholder="Mau kirim p35an apa?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#EB008B] hover:bg-[#EB008B]/80 text-white transition-colors"
      >
        {status === 'loading' ? 'M3ngirimkan...' : 'Kirim P35an!'}
      </Button>

      {status === 'success' && (
        <Text variant="body" className="text-green-600">
          T3rima ka5ih atas p35anmu!
        </Text>
      )}

      {status === 'error' && (
        <Text variant="body" className="text-red-600">
          Failed to send message. Please try again.
        </Text>
      )}
    </form>
  )
} 