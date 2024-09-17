# reallyEstate

reallyEstate is a web platform that connects buyers and agents through property reservations and real-time chat functionalities. The application is built using Next.js and TypeScript, leveraging Firebase for backend services.

## Features
- **Property Listings:** Browse and view detailed property information.
- **Real-time Chat:** Communicate instantly with agents.
- **Reservations:** Schedule viewings and express interest in properties.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org) (v14 or later)
* [Firebase CLI](https://firebase.google.com/docs/cli) (for deployment)
* [Git](https://git-scm.com/) (for version control)
* [npm or yarn](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Installation
1. Clone the repository:

   ```bash
   git clone https://github.com/jia-jjin/really-estate.git
   cd really-estate
   ```
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a Firebase project in the Firebase Console and enable Firebase Authentication and Firestore services.

   Add your Firebase project's configuration to a .env.local file at the root of your project:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Running the App
Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

## Deployment
The app is deployable on Vercel. Check out Vercel's documentation for more details.

# Technologies Used
* Next.js
* TypeScript
* Firebase
* Tailwind CSS
