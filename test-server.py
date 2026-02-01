#!/usr/bin/env python3
"""
Serveur de test local pour la PWA
Usage: python3 test-server.py
Puis ouvrez : http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Headers pour PWA
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🌐 Serveur démarré sur http://localhost:{PORT}")
    print(f"📱 Pour tester sur iPhone:")
    print(f"   1. Trouvez l'IP de votre ordinateur (ifconfig ou ipconfig)")
    print(f"   2. Ouvrez http://VOTRE-IP:{PORT} dans Safari sur iPhone")
    print(f"")
    print(f"⚠️  Note: Les PWA nécessitent HTTPS en production")
    print(f"   Utilisez ngrok ou déployez sur GitHub Pages pour l'iPhone")
    print(f"")
    print(f"Appuyez sur Ctrl+C pour arrêter")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n👋 Serveur arrêté")
