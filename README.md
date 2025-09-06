# DATA-MOCKER 📊🤖
**Transform Testing with Realistic Mock Data Instantly**

---

## 📋 Table of Contents
- [✨ Overview](#-overview)
- [🔗 Why Data-Mocker?](#-why-data-mocker)
- [🚀 Getting Started](#-getting-started)
  - [⚙️ Prerequisites](#-prerequisites)
  - [💾 Installation](#-installation)
  - [🔧 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [📬 Contact](#-contact)

---

## ✨ Overview
**Data-Mocker** is an all-in-one developer tool that simplifies the creation of realistic mock data for testing and development. It integrates seamlessly with your existing architecture, providing a robust backend API and reusable frontend components to enhance your workflow.  

With **Data-Mocker**, developers can efficiently simulate diverse data scenarios, reducing testing bottlenecks and improving productivity.

---

## 🔗 Why Data-Mocker?
Key features include:  

- 🎨 **Data Generation:** Create realistic mock data for testing and development.  
- 🔗 **Seamless Integration:** Easily embed into your architecture for smooth workflows.  
- 🧩 **Rich UI Components:** Prebuilt, accessible React components for quick UI setup.  
- 🔐 **Secure Authentication:** Manage users and sessions safely.  
- ⚙️ **API Utilities:** Simplified backend communication with centralized API clients.

---

## 🚀 Getting Started
Follow these steps to run **Data-Mocker** locally.

### ⚙️ Prerequisites
- **Python 3.8+** – [Download Python](https://www.python.org/downloads/)  
- **Node.js v16+ & npm** – [Download Node.js](https://nodejs.org/en/download/)

---

### 💾 Installation

**1. Clone the repository**  
```bash
git clone https://github.com/Piku-0/Data-Mocker.git
cd Data-Mocker
````

**2. Set up the Backend**

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

**3. Set up the Frontend**

```bash
cd ../frontend

# Install NPM packages
npm install
```

---

### 🔧 Configuration

Create a `.env` file in the project root with your environment variables:

```env
MONGODB_URI="your_mongodb_connection_string_here"
GOOGLE_API_KEY="your_google_api_key_here"
```

---

### ▶️ Usage

Start both backend and frontend servers in separate terminals:

**Backend Server:**

```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn main:app --reload
```

**Frontend Server:**

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see **Data-Mocker** live! 🎉

---

## 🤝 Contributing

Contributions make the open-source community amazing. Steps to contribute:

1. **Fork the Project**
2. **Create your Feature Branch**

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**

   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📬 Contact

**Piyush Rath**

* Email: `rathpiyush021@gmail.com`
* GitHub: [https://github.com/Piku-0/Data-Mocker](https://github.com/Piku-0/Data-Mocker)

