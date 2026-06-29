# DriveRent - Vehicle Rental Management System

## Quick Start Commands

### Backend

**Using Maven Wrapper (recommended):**

Terminal 1 - In the `backend/` directory:
```powershell
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run
```

**Or with global Maven (if installed):**
```powershell
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs on `http://localhost:8081`

---

### Frontend

Terminal 2 - In the `frontend/` directory:
```powershell
npx serve . -l 3000
```

Frontend runs on `http://localhost:3000`

---

### Both together (PowerShell)

```powershell
# Terminal 1 - Backend
cd C:\Users\shivr\OneDrive\Desktop\car-rental-main\car-rental-main\backend
.\mvnw.cmd spring-boot:run

# Terminal 2 - Frontend
cd C:\Users\shivr\OneDrive\Desktop\car-rental-main\car-rental-main\frontend
npx serve . -l 3000
```

Then open `http://localhost:3000` in your browser.

---

### Admin Credentials

**Default Admin Account** (created automatically on first run):
- **Email:** `admin@driverent.com`
- **Password:** `admin@123`

> ⚠️ For production deployments, change the default admin password immediately after first login.

---

## Admin Credentials

A default admin account is automatically seeded in the database. Use the following credentials to access the admin panel:

- **Email**: `admin@gmail.com`
- **Password**: `admin123`
