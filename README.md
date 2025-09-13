Dimension by HTML5 UP
html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
This is Dimension, a fun little one-pager with modal-ized (is that a word?) "pages"
and a cool depth effect (click on a menu item to see what I mean). Simple, fully
responsive, and kitted out with all the usual pre-styled elements you'd expect.
Hope you dig it :)

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.

(* = not included)

AJ
aj@lkn.io | @ajlkn

Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fontawesome.io)

	Other:
		jQuery (jquery.com)
		Responsive Tools (github.com/ajlkn/responsive-tools)

## Backend API

This project now includes a backend API for managing students, books, borrow plans, and borrow records.

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize the database:
```bash
npm run setup
```

This will:
- Generate Prisma client
- Run database migrations
- Seed initial data (admin user: admin/admin123)

### Development

Start the backend server:
```bash
npm run server:dev
```

Start the frontend:
```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

### API Endpoints

- `POST /auth/login` - User authentication
- `GET /students` - List all students
- `POST /students` - Create a new student
- `GET /books` - List all books
- `POST /books` - Create a new book
- `POST /borrow-plans` - Create a borrow plan
- `GET /borrow-plans/:id` - Get a specific plan
- `POST /borrow-plans/:id/execute` - Execute a plan
- `POST /borrow-plans/:id/cancel` - Cancel a plan
- `GET /borrow-records` - List borrow records
- `POST /borrow-records/:id/return` - Return a book

### Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT
- **Frontend**: Static HTML5 site
