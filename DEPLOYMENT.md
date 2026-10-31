# The Written Leaf — Architecture, API & Deployment Guide

> *Where every book leaves a trace.*

This document consolidates the technical specifications, API reference, security model, and deployment procedures for **The Written Leaf**.

---

## 🛠️ Stack & Architecture Overview

* **Frontend:** HTML5, CSS3 (custom properties, responsive layout), Vanilla JavaScript
* **Backend:** Python 3 + Flask (REST API, single-origin static file serving)
* **Database:** MySQL (relational schema with foreign keys, cascading deletes, unique constraints)
* **Authentication:** Session-based authentication with PBKDF2 password hashing (Werkzeug)
* **Security:** Parameterized SQL queries via PyMySQL, server-side privacy filtering, HttpOnly session cookies

---

## 💻 Running Locally

### 1. Prerequisites & Virtual Environment
Ensure your virtual environment is active (using Python 3.14+):
```bash
# Activate your virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install required dependencies
python -m pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `env.example` to `.env` or set environment variables in your terminal:
```powershell
# PowerShell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your-mysql-password"
$env:DB_NAME="the_written_leaf"
$env:SECRET_KEY="your-secret-key-here"
```

### 3. Initialize the Database
Ensure your MySQL server is running, then load the database schema:
```bash
mysql -u root -p < schema.sql
```

### 4. Start the Application
Run the root Flask server:
```bash
python app.py
```
* **Landing Page:** Open [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
* **Health Check:** Open [http://127.0.0.1:5000/api/hello](http://127.0.0.1:5000/api/hello) -> `{"message": "The Written Leaf API is alive."}`

---

## 📡 API Reference

All API routes return JSON and handle errors uniformly (`{"error": "message"}`).

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/hello` | No | System health check |
| `POST` | `/api/signup` | No | Create user account with hashed password; automatically starts session |
| `POST` | `/api/login` | No | Authenticate with email or username and password |
| `POST` | `/api/logout` | Yes | Clear current user session |
| `GET` | `/api/me` | No | Retrieve active user profile or `{ "logged_in": false }` |
| `PUT` | `/api/me` | Yes | Update display name and bio |
| `GET` | `/api/books` | Yes | Retrieve reading journey (all public and private entries for current user) |
| `POST` | `/api/books` | Yes | Create a new book journal entry |
| `GET` | `/api/books/<id>` | No* | Retrieve a specific entry (*private entries only visible to owner, otherwise 404) |
| `PUT` | `/api/books/<id>` | Yes | Update an existing book entry owned by the user |
| `DELETE`| `/api/books/<id>` | Yes | Delete a book entry owned by the user |
| `GET` | `/api/discover` | No | Public entries feed with pagination (`limit`, `offset`) and live like counts |
| `POST` | `/api/books/<id>/like` | Yes | Atomic toggle like/unlike on a visible book entry |
| `GET` | `/api/users/<username>` | No | Public profile information and public book entries for a specific reader |
| `POST` | `/api/lending` | Yes | Submit a request to borrow a public book marked as available |
| `GET` | `/api/lending` | Yes | Retrieve user's incoming (requests to borrow user's books) and outgoing requests |
| `PATCH`| `/api/lending/<id>` | Yes | Update lending status (`action`: `accept`, `decline`, `complete`, `cancel`) |

---

## 🔒 Security & Privacy Decisions

* **Password Security:** Passwords are never stored in plain text. They are hashed using Werkzeug's secure PBKDF2 salted hash algorithm.
* **SQL Injection Prevention:** Every database query is strictly parameterized using `%s` placeholders through PyMySQL. No dynamic SQL concatenation is used.
* **Server-Enforced Privacy:** Private entries are guarded at the query and service levels. Unauthorized requests for private books receive a `404 Not Found` to prevent timing or existence enumeration.
* **Ownership Verification:** Every edit, update, or deletion verifies that `entry["user_id"] == session["user_id"]`.
* **State Machine for Lending:** Lending workflow transitions are validated by role (owner vs. borrower) and current status.
* **Duplicate Prevention:** A `UNIQUE (user_id, entry_id)` constraint on the `likes` table prevents duplicate likes at the database layer.
* **Generic Auth Errors:** Login failures return generic responses (`"Incorrect login details."`) to prevent username/email enumeration.

---

## 🚀 Deploying to PythonAnywhere (Free Tier)

Follow these steps to deploy **The Written Leaf** to PythonAnywhere:

1. **Upload Files:**  
   Create an account on [PythonAnywhere](https://www.pythonanywhere.com) and upload the project files via the **Files** tab, or run `git clone https://github.com/zoharafatima/THE_WRITTEN_LEAF.git` in a Bash console.

2. **Configure MySQL Database:**  
   * Go to the **Databases** tab and initialize your MySQL password.
   * Create a database named `<username>$the_written_leaf`.
   * Open a MySQL console and run `schema.sql` (update the first two lines to match your database name: `USE <username>$the_written_leaf;`).

3. **Install Dependencies in Bash Console:**
   ```bash
   pip install --user -r requirements.txt
   ```

4. **Configure Web App:**  
   * Go to the **Web** tab and click **Add a new web app**.
   * Select **Manual configuration** (or Flask) with Python 3.10+.
   * Set the **Source code** path to `/home/<username>/THE_WRITTEN_LEAF`.
   * Set the **Working directory** to `/home/<username>/THE_WRITTEN_LEAF`.

5. **Configure WSGI Configuration File:**  
   In the **Web** tab, click the link to edit your WSGI configuration file (`/var/www/<username>_pythonanywhere_com_wsgi.py`). Replace its contents with:
   ```python
   import os
   import sys

   # Add project directory to sys.path
   project_home = '/home/<username>/THE_WRITTEN_LEAF'
   if project_home not in sys.path:
       sys.path.insert(0, project_home)

   # Database and application environment variables
   os.environ["DB_HOST"] = "<username>.mysql.pythonanywhere-services.com"
   os.environ["DB_USER"] = "<username>"
   os.environ["DB_PASSWORD"] = "your-mysql-password"
   os.environ["DB_NAME"] = "<username>$the_written_leaf"
   os.environ["SECRET_KEY"] = "your-long-random-production-secret-key"
   os.environ["PRODUCTION"] = "1"

   # Import Flask application object
   from app import app as application
   ```

6. **Reload and Verify:**  
   Click the green **Reload** button in the Web tab. Visit `https://<username>.pythonanywhere.com` to verify your live site.

---

## 🗺️ Roadmap & Future Enhancements

* **Image Uploads:** Support local or cloud storage (e.g., S3/Cloudinary) for custom front and back book covers.
* **External Books API:** Integrate Google Books or Open Library API for automated title, author, and cover lookup.
* **Enhanced Discover Feed:** Add keyword search by title/author and frontend pagination controls.
* **Account Recovery:** Implement password reset workflows and rate limiting on authentication routes.

