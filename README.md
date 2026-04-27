# EventX

A full-stack event management application with QR code-based check-in system and admin dashboard.

[Click here for a demo](https://drive.google.com/file/d/1or8lSjyWodZESfisWasbdFm3fEAn27xo/view?usp=sharing)

## Features

- **Multi-Event Support**: Manage multiple event types (Marriage, Reception, Birthday Party)
- **Participant Registration**: Comprehensive registration form with meal preferences, guest counts, and special requests
- **QR Code Generation**: Automatic QR code generation for each participant upon registration
- **QR Code Scanning**: Admin scanner for quick check-in at event venue
- **Admin Dashboard**: Real-time statistics with interactive visualizations
  - **Data Visualizations**: Pie charts for food preferences, chauffeur status, and guest food preferences
  - **View Toggle**: Switch between visualization view and detailed table view
  - **CSV Export**: Download complete participant data as CSV file
  - **Real-time Stats**: Total registrations, checked-in participants, and pending count
- **Event-Specific Customization**: Different form fields per event type (e.g., meal selection for marriage events)
- **Responsive Design**: Mobile-friendly interface for both participants and admins

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 8** - Build tool and dev server
- **React Router 7** - Client-side routing
- **html5-qrcode** - QR code scanning library
- **Recharts** - Chart library for data visualizations
- **CSS** - Custom styling with modern design

### Backend
- **Express 5** - Node.js web framework
- **Supabase** - PostgreSQL database and client SDK
- **qrcode** - QR code generation library
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

### Database
- **PostgreSQL** via Supabase
- Event-specific tables: `marriage`, `reception`, `birthday_party`
- Indexed fields for fast lookups

### Deployment
- **Render.com** - Cloud hosting platform
- Automated build and deployment pipeline

## User Flow

### Participant Registration Flow

1. **Landing Page** (`/`)
   - Welcome screen with event highlights
   - "Register for the event" button

2. **Event Selection** (`/register`)
   - Choose from available events (Marriage, Reception, Birthday Party)
   - Each event has its own registration form

3. **Registration Form** (`/register/:eventKey`)
   - **Personal Information**: Full name, phone number, WhatsApp number (with "same as phone" shortcut), email
   - **Guest Details**: Number of guests, veg/non-veg guest counts
   - **Event-Specific Questions**:
     - Marriage: Meal preference selection (breakfast, lunch, dinner)
     - All events: Chauffeur coming? (with food preference if yes)
   - **Special Requests**: Text area for additional requirements
   - Form validation with real-time error messages

4. **Confirmation Page** (`/confirmation`)
   - Displays participant ID and event details
   - Shows generated QR code
   - Download QR code as PNG
   - Share ticket via WhatsApp (opens `wa.me` link with participant details)

### Admin Flow

1. **Admin Authentication**
   - Password-protected admin routes
   - Admin password set via `ADMIN` environment variable

2. **Admin Scanner** (`/admin/scanner`)
   - QR code scanner using device camera
   - Real-time check-in validation
   - Three possible outcomes:
     - **Entry Allowed**: First-time check-in, shows participant details
     - **Already Checked In**: Participant already checked in
     - **Invalid QR Code**: QR code not found in database

3. **Admin Dashboard** (`/admin/dashboard`)
   - Event selection dropdown at the top
   - **Visualization View**:
     - Stat cards: Total registrations, checked-in, pending
     - Pie charts: Food preferences, chauffeur status, guest food preferences
   - **Table View**:
     - Searchable participant list
     - Filter by guest food preferences (veg/non-veg)
     - Complete participant details in table format
   - **Export Features**:
     - Download participant data as CSV file
     - Refresh data button
   - Real-time statistics update

## Technical Architecture

### Project Structure

```
eventX/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── AdminProtectedRoute.jsx
│   │   │   ├── DashboardCharts.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Navbar.jsx
│   │   ├── constants/        # Configuration constants
│   │   │   └── events.js
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── EventRegisterPage.jsx
│   │   │   ├── ConfirmationPage.jsx
│   │   │   ├── AdminScannerPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── App.jsx           # Main app component with routing
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── routes/              # API routes
│   │   ├── register.js       # POST /api/register
│   │   ├── checkin.js        # POST /api/checkin
│   │   ├── participants.js   # GET /api/participants
│   │   ├── stats.js          # GET /api/stats
│   │   └── qr.js             # POST /api/qr
│   ├── utils/               # Utility functions
│   │   ├── events.js         # Event configuration
│   │   └── qr.js            # QR code generation
│   ├── index.js             # Server entry point
│   ├── supabase.js          # Supabase client
│   ├── migration.sql        # Database schema
│   └── package.json
├── .env                     # Environment variables (not in git)
├── .env.example            # Environment variables template
├── render.yaml             # Render deployment config
└── package.json            # Root package.json with scripts
```

### Database Schema

Each event has its own table with the following structure:

```sql
CREATE TABLE {event_name} (
  id UUID PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,  -- Format: {PREFIX}-{6-char-code}
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  num_guests INTEGER DEFAULT 0,
  meal_preferences TEXT[] DEFAULT '{}',
  veg_guests INTEGER DEFAULT 0,
  non_veg_guests INTEGER DEFAULT 0,
  chauffeur_coming BOOLEAN DEFAULT false,
  chauffeur_food_preference TEXT,
  special_requests TEXT,
  qr_code TEXT,                    -- Base64 encoded QR code
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Event Prefixes:**
- Marriage: `MAR`
- Reception: `REC`
- Birthday Party: `BDP`

**Indexes:**
- `participant_id` - For fast lookups during check-in
- `checked_in` - For quick stats queries

### API Endpoints

#### Registration
- `POST /api/register` - Register a new participant
  - Request body: Event details, personal info, guest details
  - Response: Participant ID, QR code, confirmation

#### Check-in
- `POST /api/checkin` - Process QR code check-in
  - Request body: `participantId`, `eventKey`
  - Response: Check-in status, participant details

#### Participants
- `GET /api/participants?event={eventKey}&search={query}&food={filter}` - List all participants for an event
  - Query params: `event` (required), `search` (optional), `food` (optional: veg/non-veg)
  - Response: Array of participant records
- `GET /api/participants/export?event={eventKey}` - Export participants as CSV
  - Query params: `event` (required)
  - Response: CSV file download

#### Statistics
- `GET /api/stats?event={eventKey}` - Get event statistics
  - Response: `totalRegistrations`, `totalCheckedIn`
- `GET /api/stats/detailed?event={eventKey}` - Get detailed statistics for visualizations
  - Response: `totalVegGuests`, `totalNonVegGuests`, `mealPreferences`, `chauffeurStats`

#### QR Code
- `POST /api/qr` - Generate QR code for a participant ID
  - Request body: `participantId`
  - Response: Base64 encoded QR code image

#### Events
- `GET /api/events` - List all available events
  - Response: Array of event objects with `key` and `label`

#### Admin
- `POST /api/admin/verify` - Verify admin password
  - Request body: `password`
  - Response: `success: true/false`

#### Health
- `GET /api/health` - Health check endpoint
  - Response: Server status and timestamp

### Environment Variables

Create a `.env` file in the root directory:

```env
ADMIN=your_admin_password_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
PORT=5000
```

**Optional Variables:**
- `VITE_API_URL` (in client/.env): Backend API URL (defaults to empty string for relative paths)

### Key Technical Details

#### Participant ID Generation
- Format: `{EVENT_PREFIX}-{6-character-alphanumeric-code}`
- Example: `MAR-ABC123`, `REC-XYZ789`
- Generated using random character selection from A-Z and 0-9

#### QR Code System
- Generated using `qrcode` npm package
- Stored as base64-encoded string in database
- Displayed on confirmation page for participants
- Scanned using `html5-qrcode` library in admin scanner
- Contains participant ID for check-in validation

#### WhatsApp Ticket Sharing
- Participants provide a WhatsApp number during registration (can match phone number via checkbox)
- On the confirmation page, a "Send to WhatsApp" button opens a pre-filled `wa.me` link
- The message includes the participant ID and a link to the QR code
- No third-party messaging API required — uses WhatsApp's native share URL

#### Fallback Mode
- If Supabase credentials are not configured, app uses in-memory storage
- All features work except data persistence across server restarts
- Useful for development and testing without database setup

#### Security
- Admin routes protected by password verification
- Supabase uses service_role key for full database access
- RLS (Row Level Security) disabled for simplicity
- Input validation on both client and server side
- Phone number format validation (requires country code)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (optional, for persistent storage)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventX
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up database (optional)**
   - Create a Supabase project
   - Run the migration.sql in Supabase SQL editor
   - Add Supabase URL and service key to .env

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```
   This starts both client (port 5173) and server (port 5000) concurrently

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   npm start
   ```

The server will serve the built React app from the `client/dist` directory.

## Deployment

### Render.com Deployment

The application includes a `render.yaml` configuration for easy deployment:

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Render will automatically detect and use render.yaml**
4. **Add environment variables in Render dashboard:**
   - `ADMIN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

**Build Process:**
- Installs root dependencies
- Installs client dependencies
- Builds client for production
- Starts server

**Start Command:**
- `cd server && node index.js`

## Development Notes

### Adding New Events

To add a new event type:

1. **Update server/utils/events.js:**
   ```javascript
   const EVENT_CONFIG = {
     // ... existing events
     new_event: {
       key: 'new_event',
       label: 'New Event',
       table: 'new_event',
       idPrefix: 'NEW',
     },
   }
   ```

2. **Update client/src/constants/events.js:**
   ```javascript
   export const EVENTS = [
     // ... existing events
     { key: 'new_event', label: 'New Event' },
   ]
   ```

3. **Create database table** (add to migration.sql):
   ```sql
   CREATE TABLE IF NOT EXISTS new_event (
     -- Same structure as other event tables
   );
   ```

4. **Customize form fields** in EventRegisterPage.jsx if needed

### Testing Without Database

The app works in in-memory mode without Supabase:
- All features functional
- Data resets on server restart
- Perfect for development and testing

### Troubleshooting

**QR Code Scanner Not Working:**
- Ensure HTTPS is used (required for camera access)
- Check browser camera permissions
- Use localhost for development (HTTP allowed)

**Database Connection Issues:**
- Verify Supabase URL and service key
- Check Supabase project status
- Ensure migration.sql has been run

## Support

For issues or questions, please open an issue on the GitHub repository.
