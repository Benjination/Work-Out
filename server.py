# Simple HTTP Server for Testing PWA
# Run with: python3 -m http.server 8000

# To test the PWA:
# 1. Run: python3 -m http.server 8000
# 2. Open browser to: http://localhost:8000
# 3. Test on mobile by connecting to your computer's IP address

import http.server
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add HTTPS headers for better PWA support
        self.send_header('Cache-Control', 'no-cache')
        if self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        super().end_headers()

if __name__ == '__main__':
    PORT = 8000
    os.chdir(os.path.dirname(__file__))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")