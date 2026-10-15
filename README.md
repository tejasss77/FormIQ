# FORMIQ
### Train better. Move better.

FORMIQ is a commercial-grade, computer-vision fitness coaching platform that utilizes a standard webcam to analyze human exercise kinematics in real time, evaluate movement quality, count repetitions with strict state-machine verification, and provide low-latency voice coaching.

---

## ⚡ The Three Intelligence Layers

```
                      +-----------------------------+
                      |       1. COMPUTER VISION    |
                      |  Webcam Frame -> MediaPipe  |
                      |  33 3D Vector Landmarks     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    2. BIOMECHANICS ENGINE   |
                      | Joint Angles, ROM %, Tempo, |
                      | Symmetry, Posture, States   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |         3. AI COACH         |
                      | Structured Biomechanical    |
                      | Findings -> Actionable Cues |
                      +-----------------------------+
```

1. **Computer Vision**: Detects 33 high-precision anatomical landmarks via Google MediaPipe Pose Landmarker at 60 FPS.
2. **Biomechanics Engine**: Calculates joint angles via vector dot/cross products, tracks state transitions (`START -> DESCENDING -> INFLECTION -> ASCENDING`), computes composite 0-100 Form Score (40% technique, 25% ROM, 20% stability, 15% tempo).
3. **AI Coach**: Converts structured kinematic events into concise, imperative human coaching cues (e.g., *"Drive through your heels."*, *"Keep your chest up."*) with audio cooldown throttling.

---

## 🎨 Design System

Designed to feel like a **$100M consumer fitness brand** (Apple Fitness+, WHOOP, high-end athletic performance labs):

- **Primary Background**: `#090909`
- **Surface**: `#111111`
- **Secondary Surface**: `#181818`
- **Primary Text**: `#F5F5F5`
- **Secondary Text**: `#A1A1A1`
- **Muted**: `#666666`
- **Primary Accent**: `#C8FF3D` (Electric Lime used with restraint)
- **Success / Warning / Error**: `#7CFF6B` / `#FFB84D` / `#FF5C5C`

---

## 🏋️ Covered Disciplines & Biomechanical Standards

| Movement | Key Joint Angles | Monitored Kinematics | Detected Faults |
| :--- | :--- | :--- | :--- |
| **Squat** | Knee (90-95°), Hip, Torso | Femoral crease depth, Valgus alignment | Too Shallow, Knee Collapse, Back Lean |
| **Push-Up** | Elbow (90° flex, 175° lock) | Plank line (Shoulder-Hip-Ankle) | Hip Sag, Hip Raise, Partial Rep |
| **Biceps Curl** | Elbow (45° flex, 155° ext) | Torso sway angle, Upper arm flare | Body Swing, Elbow Drift, Partial ROM |
| **Shoulder Press** | Elbow (165°+ lockout) | Lumbar spine arch, Overhead path | Lumbar Arch, Incomplete Lockout |
| **Forward Lunge** | Lead Knee (90°), Rear Knee | Lead knee overshoot, Pelvic tilt | Knee Overshoot, Forward Lean, Unstable |

---

## 🛠 Tech Stack

### Frontend
- **React 19** & **Vite**
- **Tailwind CSS v4**
- **Framer Motion** (Subtle, athletic micro-interactions)
- **Lucide React**
- **Recharts** (Performance & telemetry trajectories)
- **HTML5 Canvas** (60 FPS HUD Skeleton rendering)
- **SpeechSynthesis API** (Zero-latency voice coaching with cooldown)

### Backend
- **Python 3.12**
- **FastAPI**
- **MediaPipe Pose Landmarker** (TensorFlow Lite XNNPACK acceleration)
- **OpenCV & NumPy**
- **SQLAlchemy 2.0 Async** + **aiosqlite** / **PostgreSQL**
- **WebSockets** (`/ws/workout/{id}`)
- **JWT Authentication** + **bcrypt** password hashing

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- Python 3.12+

### 1. Start the Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will automatically seed default exercises and a demo athlete profile (`athlete@formiq.com`).

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🐳 Docker Deployment

To launch the full production stack (PostgreSQL + FastAPI + Nginx Frontend):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🔐 Demo Credentials
- **Email**: `athlete@formiq.com`
- **Password**: `athlete123`
*(Or click **Instant Demo (Pro Athlete)** on the sign-in screen)*
