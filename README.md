# 🎨 Art Gallery & Workshop Management System

Welcome to the **Art Gallery & Workshop Management System**! This is a comprehensive, full-stack web application designed to bring art enthusiasts, artists, and workshop owners together under one creative roof. 

Whether you want to browse and purchase unique artworks, reserve a spot in a creative workshop, or manage your own art portfolio, this platform provides a seamless and dynamic experience.

---

## ✨ Key Features

### 🖼️ For Art Enthusiasts
- **Discover Artworks:** View detailed information, high-quality images, and artist portfolios.
- **Smart Comparison:** Compare multiple artworks or events side-by-side based on price, category, and capacity.
- **Favorites & Purchasing:** Save your favorite artworks and purchase them securely.
- **Dynamic Events:** Discover, book, and manage your reservations for upcoming art workshops.
- **Interactive Reviews:** Rate artworks and events, read community reviews, and vote on helpful feedback.
- **Coupons & Campaigns:** Enjoy special discount codes and seasonal campaigns on both artworks and tickets.

### 🖌️ For Artists & Workshop Owners
- **Role Management:** Apply for a specialized "Artist" or "Workshop Owner" role from your profile.
- **Personal Dashboard:** Track your artwork views, sales, event capacities, and manage your portfolio.
- **Interact with Attendees:** Read and reply to comments left by users who attended your workshops.
- **Order Management:** Approve or reject incoming purchase requests directly from your panel.

### 🛡️ Admin & Platform Management
- **Role Approvals:** Review and approve role upgrade requests from users.
- **Global Statistics:** View platform-wide statistics for events and artworks.
- **Secure Authentication:** BCrypt password hashing ensures user data remains secure.
- **Customer Support System:** Users can send support tickets and track responses.

---

## 🚀 Technologies Used

- **Backend:** C#, .NET Core Web API
- **Database:** PostgreSQL (with **Dapper** micro-ORM for high performance)
- **Frontend:** HTML5, Vanilla CSS, Vanilla JavaScript (No heavy frameworks, blazing fast!)
- **Security:** BCrypt.Net for secure password hashing.

---

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Database Setup
Ensure you have **PostgreSQL** installed on your system.

```bash
# 1. Log in to PostgreSQL
sudo -u postgres psql

# 2. Create the database
CREATE DATABASE art_gallery_db;
\q

# 3. Run the schema and seed files to construct the database
cat Database/create_tables.sql | sudo -u postgres psql -d art_gallery_db
cat Database/dummy_data.sql | sudo -u postgres psql -d art_gallery_db
```

### 2. Backend Setup
Navigate to the Backend directory and start the .NET API server.

```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```
*The API will start running, typically accessible at `http://localhost:5160/api`.*

### 3. Frontend Setup
The frontend is built with pure HTML/JS/CSS, so you don't need Node.js or npm! Simply serve the `Frontend` directory using any local development web server.

```bash
# Example using Python's built-in HTTP server:
cd Frontend
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 📋 Roadmap & Known Issues
While the core functionality is robust, here are some features planned for the future:
- [ ] **Live Chat Support:** Real-time messaging system for customer service.
- [ ] **Verified Buyer Badge:** Adding a "Verified Purchase" tag to reviews from actual buyers.
- [ ] **Artwork Comment Replies:** Implementing the UI and backend logic for artists to reply to comments on their artworks.
- [ ] **JWT Authentication:** Adding token-based middleware for secured API endpoints.

---
*Made with ❤️ for Art Lovers.*