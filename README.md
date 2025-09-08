
# wellfire.com
Backend Dependencies (Create backend if not exists):
bashnpm install express mongoose cors dotenv bcryptjs jsonwebtoken multer helmet morgan express-rate-limit joi cloudinary
npm install -D nodemon
Admin Panel Dependencies:
bashnpm install react react-dom react-router-dom axios prop-types react-toastify react-icons @vitejs/plugin-react vite tailwindcss postcss autoprefixer
Frontend Dependencies:
bashnpm install react react-dom react-router-dom axios react-toastify react-icons framer-motion lucide-react @vitejs/plugin-react vite tailwindcss postcss autoprefixer
🔧 Quick Start Commands:

Setup all dependencies:

bash# Admin panel
cd admin && npm install

# Frontend
cd frontend && npm install

# Backend 
cd backend && npm install

Create environment files:


.env in backend with MongoDB URI, JWT secret
.env in admin with VITE_BACKEND_URL=http://localhost:4000
.env in frontend with VITE_BACKEND_URL=http://localhost:4000


Run the application:

bash# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Admin  
cd admin && npm run dev

# Terminal 3 - Frontend
cd frontend && npm run dev
The README includes all necessary setup instructions, dependencies, API endpoints, and deployment guides. Your project structure suggests a sophisticated entertainment investment platform with admin management capabilities!
