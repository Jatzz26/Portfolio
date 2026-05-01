# Jatin Pathak — Full-Stack Portfolio
# live - https://portfolio1-qj50.onrender.com

A premium, high-performance personal portfolio website built with a Node.js/Express backend and a modern Tailwind-powered frontend. This project features a robust contact system, an admin dashboard, and a sleek dark-themed UI.

## 🚀 Features

- **Premium UI/UX**: Dark-themed design with custom animated cursors, smooth transitions, and glassmorphism.
- **Full-Stack Architecture**: Express.js server serving static HTML pages with clean URL routing.
- **Secure Contact System**: Integrated contact form with:
  - **Database Persistence**: Messages stored in MongoDB.
  - **Email Notifications**: Real-time alerts via NodeMailer (Gmail).
  - **Rate Limiting**: Protection against spam (10 requests per 15 mins).
- **Admin Dashboard**: A secure, token-protected interface to view, manage, and delete incoming messages.
- **CV Download**: Dedicated route for direct CV downloads.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Health Monitoring**: `/api/health` endpoint for server and database status checks.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS (via CDN), Google Fonts, Material Symbols.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Tools**: NodeMailer, Express-Rate-Limit, Dotenv, Nodemon.

## 📁 Project Structure

```text
portfolio/
├── backend/          # Node.js/Express server logic
│   ├── models/       # Mongoose database schemas
│   ├── routes/       # API and Admin routes
│   ├── server.js     # Main application entry point
│   └── .env.example  # Template for environment variables
├── frontend/         # Static HTML pages
│   ├── home.html
│   ├── experience.html
│   ├── project.html
│   └── ...
├── public/           # Shared assets (Images, CV, etc.)
└── README.md         # Project documentation
```

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Jatzz26/Portfolio.git
cd Portfolio
```

### 2. Configure Environment Variables
Navigate to the `backend` directory and create a `.env` file based on `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: Your MongoDB connection string
- `ADMIN_TOKEN`: A secret string for dashboard access
- `EMAIL_USER` & `EMAIL_PASS`: Gmail App Password for notifications
- `NOTIFICATION_EMAIL`: Where you want to receive contact alerts

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application

**Development Mode (Auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will be running at `http://localhost:3000`.

## 🛡️ Admin Dashboard

To access the admin dashboard, navigate to:
`http://localhost:3000/admin?token=YOUR_ADMIN_TOKEN`

Replace `YOUR_ADMIN_TOKEN` with the value set in your `.env` file.

## 📄 License

This project is personal property. Feel free to use it as inspiration for your own portfolio.
