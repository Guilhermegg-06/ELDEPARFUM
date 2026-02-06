'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">ELDEPARFUM</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A sua vitrine de contratipos de perfumes  premium. Descubra fragrâncias luxuosas e exclusivas para expressar sua personalidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer">
                <Phone className="w-4 h-4" />
                <span>55 82 9147-9637</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer">
                <Mail className="w-4 h-4" />
                <span>contato@eldeparfum.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Macéio - AL</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2026 ELDEPARFUM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
