# Climx — Environmental Accountability for India 🇮🇳

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Climx** is a high-performance, AI-driven civic engagement platform designed to empower Indian citizens to report environmental issues, monitor real-time air quality, and drive community-led change through collective action.

---

## 🌟 Key Features

### 1. Live AQI & Analytics Dashboard
- **Precision Monitoring**: Real-time AQI data fetched via Google Air Quality API.
- **Historical Trends**: Visual analytics of AQI variations over time using Recharts.
- **Groundwater Analysis**: Integration with CGWB data to provide state-wise groundwater extraction levels and assessment statuses.

### 2. Civic Reporting System (AI-Powered)
- **Visual Evidence**: Upload geo-tagged photos/videos of environmental violations (stubble burning, illegal dumping, etc.).
- **Smart Summarization**: Integrated with **Groq (Llama 3.3)** to automatically generate concise titles and summaries from raw descriptions.
- **Duplicate Detection**: Uses **Pinecone Vector Search** to identify similar reports in the same vicinity, preventing spam and consolidating community efforts.

### 3. Hybrid RAG AI Assistant
- **Context-Aware Support**: A sophisticated chat interface that uses **Hybrid Retrieval-Augmented Generation (RAG)**.
- **Dual Search**: Combines MongoDB text search (keywords) with Pinecone vector search (semantic) to provide accurate answers about local environmental issues.
- **Live Data Injection**: Automatically injects real-time groundwater and community report data into AI prompts.

### 4. Community Feed & Social Engagement
- **Reddit-style Interaction**: Anonymized community feed with real-time upvoting and commenting.
- **High-Speed Updates**: Powered by **Redis** for ultra-low latency social interactions and **Socket.io** for instant synchronization across all clients.

### 5. Community Challenges & Gamification
- **Collective Action**: Join challenges like "Plant 100 Trees in Sector 32" with animated progress tracking.
- **Impact Scoring**: Earn badges (Air Watcher, River Guard) and climb the leaderboard based on verified reporting and community participation.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TanStack Start (Vite), Tailwind CSS 4, Framer Motion, Lucide React |
| **State Management** | TanStack Query (React Query), TanStack Router |
| **Backend** | Node.js, Express, Socket.io, Winston (Logging), Zod (Validation) |
| **Authentication** | Clerk (JWT-based, Secure SSR) |
| **Database** | MongoDB (Primary), Redis / Upstash (Caching/Social), Pinecone (Vector) |
| **AI / ML** | Groq (Llama 3.3 70B), Nomic Embeddings |
| **Maps** | Mapbox GL JS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis (Upstash) account
- Pinecone account
- Groq API Key
- Clerk account (Frontend & Backend keys)
- Mapbox Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/knishkarora/Data-Dynamo.git
   cd Data-Dynamo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with your credentials (see .env.example)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with your Clerk and Mapbox keys
   npm run dev
   ```

---

## 🏗 System Design & Scalability

### Architectural Excellence
- **Event-Driven Architecture**: Uses WebSockets (Socket.io) to ensure that a report submitted in one city is instantly visible to all users without a page refresh.
- **Redis-First Social Interaction**: To handle high-traffic social engagement (votes/comments), Climx uses a **Redis-first strategy**. Votes are toggled in Redis in milliseconds and synced to MongoDB asynchronously via a background process.
- **Hybrid RAG Strategy**: The AI assistant doesn't just rely on general knowledge; it queries a vector database (Pinecone) for semantic similarity and MongoDB for exact keyword matches, ensuring that users get hyper-local, accurate information.

### Scalability Metrics
- **Horizontal Scaling**: The stateless Express backend can be containerized and scaled horizontally behind a load balancer.
- **Vector Search**: Pinecone allows the platform to scale to millions of reports while maintaining sub-second duplicate detection and semantic search.
- **Edge-Ready Frontend**: Built on TanStack Start, the frontend is optimized for SSR and can be deployed to edge networks like Vercel or Cloudflare Workers.

---

## 🎨 UI/UX Design Philosophy

- **Premium Aesthetics**: A "Glassmorphic" dark-themed design system featuring high-contrast accents (`teal`, `blueaccent`, `warn`).
- **Micro-Animations**: Every interaction (voting, loading, navigating) is enhanced with **Framer Motion** to provide a fluid, premium app-like experience.
- **Information Hierarchy**: Complex environmental data is simplified into beautiful **GlassCard** components and interactive charts.
- **Accessibility**: Built with semantic HTML, descriptive ARIA labels, and a clear heading structure for SEO and screen readers.

---

## 📊 Quality & Metrics

- **Code Quality**: Strict linting with ESLint, type-safety via TypeScript, and modular component architecture.
- **Security**: JWT verification via Clerk, Helmet.js for header security, and Zod for strict API input validation.
- **Logging**: Robust server-side logging with Winston, tracking everything from GPS precision issues to AI processing latency.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built for a cleaner, greener India.** 🌿
