# MockVerse

MockVerse is an AI-powered mock interview platform for practicing role-based interviews. Users authenticate with Google, choose an interview role and experience level, optionally upload a PDF resume, answer timed questions by voice or text, and receive AI-generated evaluation and performance reports.

The project is intended for job seekers and students preparing for technical or HR interviews. Its most notable implemented behavior is response-driven difficulty adjustment: after an answer is evaluated, the next question in the existing session is assigned an easier, equal, or harder difficulty based on the score.

## Current Features

- Google sign-in through Firebase Authentication.
- JWT session cookie issued by the Express backend.
- Technical and HR interview modes.
- Role, experience, project, skills, and resume context passed to question generation.
- Optional PDF resume upload and text extraction with `pdfjs-dist`.
- OpenRouter-powered resume parsing, question generation, and answer evaluation.
- Rule-based ATS resume scoring from 0 to 100.
- Browser speech recognition for capturing answers where supported.
- Browser speech synthesis for the AI interviewer voice.
- Timed questions with difficulty badges.
- Difficulty adjustment based on answer scores:
  - score `>= 7`: move harder (`easy -> medium`, `medium -> hard`, `hard -> hard`)
  - score `<= 4`: move easier (`hard -> medium`, `medium -> easy`, `easy -> easy`)
  - score `5` or `6`: keep the current difficulty
- Interview history and report pages.
- Performance charts, question-level feedback, difficulty distribution, and PDF report download.
- Credit system with paid credit packs through Razorpay.

### Not currently implemented

- Topic-aware follow-up routing from `topicWeakness`.
- `interview.adaptationTrace` event logging.
- Server-side audio processing or an external voice provider.
- Automated test suites.
- Deployment configuration for Vercel, Render, Railway, Docker, or another host.

The interview question list is generated in one OpenRouter request at session creation. Difficulty changes are persisted on the next question already stored in that session; the backend does not make a new OpenRouter question-generation request after every answer.

## Tech Stack

| Area | Technology | Version / usage |
| --- | --- | --- |
| Frontend | React | `^19.2.0`; UI components and pages in `client/src` |
| Frontend build | Vite | `^7.3.1`; development server and production build |
| Backend | Node.js with Express | Express `^5.2.1`; HTTP API in `server/index.js` |
| Language | JavaScript | ES modules on both client and server; JSX on the client |
| Database | MongoDB | Accessed through Mongoose `^9.2.1`; MongoDB Atlas is supported by the `mongodb+srv` URL format |
| ODM | Mongoose | User, interview, and payment models |
| Authentication | Firebase Authentication + Google provider | Firebase client sign-in, followed by backend JWT cookie creation |
| Sessions | JSON Web Tokens | `jsonwebtoken ^9.0.3`; token is stored in an HTTP cookie for seven days |
| AI provider | OpenRouter | HTTP call to `https://openrouter.ai/api/v1/chat/completions` |
| AI model | `openai/gpt-4o-mini` | Configured in `server/services/openRouter.service.js` |
| HTTP client | Axios | Client API calls and server OpenRouter/Razorpay-related calls |
| Voice input | Browser Web Speech API | Uses `webkitSpeechRecognition` in `Step2Interview.jsx` |
| Voice output | Browser Speech Synthesis API | Uses `window.speechSynthesis` and `SpeechSynthesisUtterance` |
| Payments | Razorpay | Server SDK `^2.9.6`; browser checkout script is loaded in `client/index.html` |
| PDF parsing | `pdfjs-dist` | Extracts text from uploaded resume PDFs on the server |
| PDF reports | `jspdf` and `jspdf-autotable` | Client-side downloadable interview report |
| Styling | Tailwind CSS | `^4.1.18`, integrated with `@tailwindcss/vite ^4.1.18` |
| UI icons | `react-icons` | Icons used throughout the client |
| Animation | `motion` | Page and component animations |
| Charts | `recharts` | Performance trend chart |
| Score visualisation | `react-circular-progressbar` | Overall interview score |
| Client state | Redux Toolkit and React Redux | Currently stores authenticated `userData` only |
| Routing | `react-router-dom` | Client routes in `client/src/App.jsx` |
| Package manager | npm | Separate lockfiles and `package.json` files under `client` and `server` |
| Deployment | Not configured | No deployment manifest or hosting configuration was found |

Node.js and npm minimum versions are not declared in either `package.json`; use a current Node.js LTS release. Exact compatibility with older Node versions needs confirmation.

## Architecture

```text
Browser
  |
  | React/Vite client at http://localhost:5173
  |
  +-- Firebase Google sign-in
  |       |
  |       +-- Client sends name/email to Express
  |
  +-- Axios requests with credentials
          |
          v
Express API at http://localhost:8000
  |
  +-- JWT cookie authentication middleware
  |
  +-- Interview routes
  |      |
  |      +-- Multer PDF upload -> pdfjs-dist text extraction
  |      +-- OpenRouter resume parsing and question generation
  |      +-- OpenRouter answer evaluation
  |      +-- Rule-based ATS scoring
  |      +-- Adaptive difficulty mutation on stored questions
  |
  +-- User/payment routes
          |
          +-- Mongoose -> MongoDB
          +-- Razorpay order creation and signature verification

Browser voice APIs
  +-- Speech recognition -> answer text -> Express evaluation endpoint
  +-- Speech synthesis <- feedback and generated question text

Client report UI
  +-- Scores, feedback, charts, difficulty distribution, PDF download
```

The client and server communicate through JSON and multipart form-data HTTP requests. Cookies are sent with Axios using `withCredentials: true`. The server uses Mongoose to read and write MongoDB documents. OpenRouter and Razorpay are called from the server, except Razorpay Checkout is opened in the browser using the public checkout key.

## Project Structure

```text
MockVerse/
├── README.md
├── .gitignore
├── client/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── .gitignore
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── App.css
│       ├── index.css
│       ├── assets/
│       │   └── videos/
│       ├── components/
│       │   ├── AuthModel.jsx
│       │   ├── Footer.jsx
│       │   ├── Navbar.jsx
│       │   ├── Step1SetUp.jsx
│       │   ├── Step2Interview.jsx
│       │   ├── Step3Report.jsx
│       │   └── Timer.jsx
│       ├── pages/
│       │   ├── Auth.jsx
│       │   ├── Home.jsx
│       │   ├── InterviewHistory.jsx
│       │   ├── InterviewPage.jsx
│       │   ├── InterviewReport.jsx
│       │   └── Pricing.jsx
│       ├── redux/
│       │   ├── store.js
│       │   └── userSlice.js
│       └── utils/
│           └── firebase.js
└── server/
    ├── package.json
    ├── package-lock.json
    ├── index.js
    ├── .gitignore
    ├── config/
    │   ├── connectDb.js
    │   └── token.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── interview.controller.js
    │   ├── payment.controller.js
    │   └── user.controller.js
    ├── middlewares/
    │   ├── isAuth.js
    │   └── multer.js
    ├── models/
    │   ├── interview.model.js
    │   ├── payment.model.js
    │   └── user.model.js
    ├── routes/
    │   ├── auth.route.js
    │   ├── interview.route.js
    │   ├── payment.route.js
    │   └── user.route.js
    ├── services/
    │   ├── openRouter.service.js
    │   └── razorpay.service.js
    ├── utils/
    │   └── atsScoreCalculator.js
    └── public/
        └── .gitkeep
```

Important files:

- `client/src/App.jsx`: client routes, Redux user bootstrap request, and the hardcoded local API base URL.
- `client/src/components/Step1SetUp.jsx`: role/mode setup, resume upload, ATS display, and interview creation request.
- `client/src/components/Step2Interview.jsx`: question presentation, timer, browser speech input/output, answer submission, and interview completion.
- `client/src/components/Step3Report.jsx`: score dashboard, question breakdown, difficulty distribution, charts, and PDF export.
- `server/index.js`: Express app, CORS, middleware, route mounting, port, and database startup.
- `server/controllers/interview.controller.js`: resume analysis, question creation, answer evaluation, adaptive difficulty, finish, history, and report logic.
- `server/services/openRouter.service.js`: OpenRouter request wrapper.
- `server/utils/atsScoreCalculator.js`: deterministic ATS scoring rules.
- `server/models/*.model.js`: MongoDB document schemas.

## Application Workflow

1. The browser loads the Vite React app and requests `/api/user/current-user` with credentials.
2. A visitor can open the Google sign-in UI. Firebase `signInWithPopup` authenticates the Google account in `client/src/pages/Auth.jsx`.
3. The client sends the Google user's name and email to `POST /api/auth/google`.
4. The server creates or finds the MongoDB user, signs a JWT, and sends it in the `token` cookie.
5. The user opens `/interview` and selects a role, experience value, and `Technical` or `HR` mode.
6. The user may upload a PDF resume. Multer stores it temporarily under `server/public`, `pdfjs-dist` extracts its text, OpenRouter returns role/experience/projects/skills JSON, and `calculateATSScore` returns the deterministic ATS result. The temporary upload is deleted.
7. The client calls `POST /api/interview/generate-questions`. The server checks the user's credits, sends role and resume context to OpenRouter, parses up to five newline-separated questions, deducts 50 credits, and stores the interview.
8. All initially stored questions are assigned `difficultyLevel: "medium"` and a 90-second time limit.
9. `Step2Interview` reads each question, speaks it with browser speech synthesis, and optionally captures the answer using Chrome-style `webkitSpeechRecognition`. Typed answers are also supported.
10. The client submits the answer and elapsed time to `POST /api/interview/submit-answer`. OpenRouter returns confidence, communication, correctness, final score, and feedback as JSON.
11. The server stores the evaluation. It calculates the next difficulty from the current question's score and mutates the next stored question's difficulty and time limit.
12. After the final question, the client calls `POST /api/interview/finish`. The server calculates averages, marks the interview completed, and returns the final report data.
13. The client displays score cards, a chart, question feedback, difficulty counts, and a PDF download option.
14. Completed and incomplete interviews can be listed from `/history`; a report can be loaded by ID from `/report/:id`.

## AI Implementation

### Provider and model

The backend calls OpenRouter from `server/services/openRouter.service.js`:

- URL: `https://openrouter.ai/api/v1/chat/completions`
- Model: `openai/gpt-4o-mini`
- Authentication: `Authorization: Bearer ${OPENROUTER_API_KEY}`
- No temperature or other sampling option is configured in the request.

The service validates that a non-empty messages array and `OPENROUTER_API_KEY` exist. It returns the first response message's content and throws on an empty response or Axios/API error.

### Resume analysis

`analyzeResume` in `server/controllers/interview.controller.js` sends the extracted resume text with a system prompt asking for strict JSON:

```json
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
```

The controller parses the response using `JSON.parse`. Invalid JSON results in the controller's 500 response. The ATS score is not generated by the model; it is calculated locally by `server/utils/atsScoreCalculator.js`.

### Question generation

`generateQuestion` sends role, experience, interview mode, projects, skills, and resume text to OpenRouter. The prompt requests exactly five natural-language questions, one per line, with 15 to 25 words each. The response is split by newline and limited to five entries.

The current implementation does not request five separate difficulty levels from the model. The five questions are initially saved as medium. Adaptive difficulty changes the `difficultyLevel` and `timeLimit` of the next already-generated question after an answer is evaluated.

### Answer evaluation

`submitAnswer` sends the current question and candidate answer to OpenRouter. The prompt requests only JSON with:

```json
{
  "confidence": 0,
  "communication": 0,
  "correctness": 0,
  "finalScore": 0,
  "feedback": "short human feedback"
}
```

The controller stores those values in the question document. It does not currently ask the model for `topicWeakness` or `topicStrength`, and it does not perform topic-aware follow-up generation.

### Error handling

- Missing OpenRouter key: explicit error from `openRouter.service.js`.
- Empty AI content: explicit error from the service or controller.
- Invalid model JSON: caught by the controller and returned as a 500 response.
- OpenRouter HTTP/API errors: logged server-side and rethrown as an error.

## Voice Interview Implementation

Voice processing is browser-only:

- `Step2Interview.jsx` uses `window.speechSynthesis` and `SpeechSynthesisUtterance` to speak introductions, questions, transition text, and feedback.
- It selects an available browser voice using names such as Zira, Samantha, David, or Mark, then falls back to the first available voice.
- It uses `webkitSpeechRecognition` when available, with `en-US`, continuous recognition, and interim results disabled.
- Recognition transcripts are appended to the text answer state.
- The same component stops recognition while the AI voice is speaking and restarts it afterward.
- Typed answers work independently of speech recognition.
- On unsupported browsers, speech recognition is skipped; no server-side audio fallback exists.
- The server receives only text in `submit-answer`; it does not receive audio.

The animated interviewer visuals use local MP4 assets at `client/src/assets/videos/male-ai.mp4` and `female-ai.mp4`.

## Authentication

Authentication has two parts:

1. Firebase client authentication:
   - `client/src/utils/firebase.js` initializes Firebase and a `GoogleAuthProvider`.
   - `client/src/pages/Auth.jsx` calls `signInWithPopup(auth, provider)`.
   - The client sends the resulting display name and email to `/api/auth/google`.
2. Backend session authentication:
   - `server/controllers/auth.controller.js` finds or creates a MongoDB `User`.
   - `server/config/token.js` signs `{ userId }` with `JWT_SECRET` for seven days.
   - The token is set as a cookie named `token`.
   - `server/middlewares/isAuth.js` verifies the cookie and sets `req.userId`.

Protected routes use `isAuth`: current user, resume analysis, question generation, answer submission, finish, history, report, payment order, and payment verification. There is no custom email/password form or additional OAuth provider in the code. Logout clears the token cookie.

The cookie is currently configured with `secure: false`, `sameSite: "strict"`, and a seven-day lifetime. This is suitable for the current local HTTP setup but needs production hardening.

## Database

MongoDB is accessed through Mongoose. `server/config/connectDb.js` calls `mongoose.connect(process.env.MONGODB_URL)`.

### User collection

Defined in `server/models/user.model.js`:

- `name`: required string
- `email`: required and unique string
- `credits`: number, default `100`
- timestamps

### Interview collection

Defined in `server/models/interview.model.js`:

- `userId`: required reference to `User`
- `role`: required string
- `experience`: required string
- `mode`: `HR` or `Technical`
- `resumeText`: optional string
- `questions`: embedded question documents
- `finalScore`: number, default `0`
- `status`: `Incompleted` or `completed`
- timestamps

Question documents contain question text, legacy `difficulty`, `difficultyLevel`, `timeLimit`, answer, feedback, score, confidence, communication, correctness, `confidenceScore`, `topicStrength`, and `topicWeakness`. The topic fields exist in the schema but are not populated by the current controller. There is no `adaptationTrace` field.

### Payment collection

Defined in `server/models/payment.model.js`:

- `userId`: reference to `User`
- `planId`, `amount`, `credits`
- Razorpay order/payment IDs
- `status`: `created`, `paid`, or `failed`
- timestamps

There are no migration or seed scripts. MongoDB collections are created/updated through normal Mongoose model operations.

## API Endpoints

The backend is mounted under `http://localhost:8000` in the client. The server fallback port is `6000`, but the current client expects port `8000`, so set `PORT=8000` for the local setup described below.

All protected endpoints require the `token` cookie and `withCredentials: true` from the client.

| Method | Endpoint | Auth | Purpose | Request | Response |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/google` | No | Find/create a Google-authenticated user and issue JWT cookie | `{ name, email }` | User document |
| GET | `/api/auth/logout` | No | Clear JWT cookie | None | Success message |
| GET | `/api/user/current-user` | Yes | Load current user | None | User document |
| POST | `/api/interview/resume` | Yes | Upload and analyze a PDF resume | Multipart field `resume` | Parsed role, experience, projects, skills, resume text, `atsScore` |
| POST | `/api/interview/generate-questions` | Yes | Create an interview and deduct 50 credits | `{ role, experience, mode, resumeText, projects, skills }` | Interview ID, credits left, user name, questions |
| POST | `/api/interview/submit-answer` | Yes | Evaluate one answer and adapt next question | `{ interviewId, questionIndex, answer, timeTaken }` | Feedback and `nextDifficulty` |
| POST | `/api/interview/finish` | Yes | Complete an interview and calculate averages | `{ interviewId }` | Final score, averages, difficulty breakdown, question scores |
| GET | `/api/interview/get-interview` | Yes | List current user's interviews | None | Sorted interview summaries |
| GET | `/api/interview/report/:id` | Yes | Load one interview report | URL parameter `id` | Final score, averages, question data |
| POST | `/api/payment/order` | Yes | Create a Razorpay credit-pack order | `{ planId, amount, credits }` | Razorpay order |
| POST | `/api/payment/verify` | Yes | Verify payment signature and add credits | Razorpay payment response fields | Verification status and updated user |

The report endpoint currently returns the stored questions directly and does not add the `difficultyBreakdown` object that the in-session finish response returns. The report UI has a fallback of zero for missing breakdown values.

## Environment Variables

Create `server/.env` and `client/.env` locally. Never commit either file.

### Server variables

| Variable | Purpose | Required? |
| --- | --- | --- |
| `PORT` | Express listening port; the client is configured for `8000` | No; defaults to `6000` |
| `MONGODB_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Signs and verifies authentication cookies | Yes |
| `OPENROUTER_API_KEY` | Authorizes OpenRouter requests | Yes for resume analysis, question generation, and answer evaluation |
| `RAZORPAY_KEY_ID` | Server Razorpay client key ID | Yes for payments |
| `RAZORPAY_KEY_SECRET` | Server Razorpay signing/SDK secret | Yes for payments; server-only |

### Client variables

| Variable | Purpose | Required? |
| --- | --- | --- |
| `VITE_FIREBASE_APIKEY` | Firebase client API key used by `firebase.js` | Yes for Google sign-in |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay Checkout key | Yes for payment checkout |

The client also contains a hardcoded Firebase project configuration and a hardcoded local API base URL in `client/src/App.jsx`. The Firebase API key and Razorpay checkout key are client-side values; server secrets must never be placed in `client/.env`.

Example server `.env`:

```env
PORT=8000
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/mockverse
JWT_SECRET=replace_with_a_long_random_secret
OPENROUTER_API_KEY=replace_with_openrouter_key
RAZORPAY_KEY_ID=replace_with_razorpay_key_id
RAZORPAY_KEY_SECRET=replace_with_razorpay_secret
```

Example client `.env`:

```env
VITE_FIREBASE_APIKEY=replace_with_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=replace_with_razorpay_public_key
```

No `.env.example` file currently exists in the repository. The examples above are placeholders and contain no working credentials.

## Installation

### Prerequisites

- Node.js current LTS and npm. The repository does not declare an exact Node.js version.
- A MongoDB database, typically MongoDB Atlas.
- A Firebase project with Google sign-in enabled.
- An OpenRouter API key.
- Razorpay credentials only if paid credit packs will be tested.
- A browser with Web Speech API support for voice input. Typed answers remain available without it.

### Clone

```powershell
git clone https://github.com/PoojaBhatiwal63/MockVerse.git
cd MockVerse
```

### Install dependencies

Dependencies are installed separately because there is no root `package.json`:

```powershell
cd client
npm install

cd ..\server
npm install
```

## Environment Setup

Create the files manually because no `.env.example` file is currently committed:

```powershell
New-Item server\.env
New-Item client\.env
```

Add the variables from the examples above. Do not copy credentials from another machine. If a MongoDB password contains URI-reserved characters such as `@`, `#`, `/`, `:`, or `%`, URL-encode the password before placing it in `MONGODB_URL`.

For Google sign-in, configure the Firebase web app and enable the Google provider. The code expects the Firebase web key in `VITE_FIREBASE_APIKEY`; the remaining Firebase project identifiers are currently in `client/src/utils/firebase.js`.

## Database Setup

No migrations or seed commands are present.

1. Create or select a MongoDB Atlas cluster.
2. Create a database user and copy its connection string.
3. Add the development machine's IP address under Atlas Network Access.
4. Put the connection string in `server/.env` as `MONGODB_URL`.
5. Start the server. Mongoose creates the application collections as the code first writes users, interviews, and payments.

If MongoDB reports `bad auth`, verify the database username/password. If it reports `querySrv ENOTFOUND`, verify the Atlas hostname and local DNS/network configuration. If it reports that no servers are reachable, check Atlas Network Access and cluster availability.

## Running the Project

The client and server run as separate processes.

### Terminal 1: backend

```powershell
cd MockVerse\server
npm run dev
```

This runs `nodemon index.js`. With `PORT=8000`, the API is available at `http://localhost:8000`.

### Terminal 2: frontend

```powershell
cd MockVerse\client
npm run dev
```

Vite normally serves the client at `http://localhost:5173`. Open that URL in a browser.

The server CORS configuration currently allows only `http://localhost:5173`, and the client API URL is hardcoded to `http://localhost:8000`. If either port changes, update the corresponding source/configuration as well.

## Production Build

The client has a production build command:

```powershell
cd client
npm run build
```

The output is written to `client/dist`. A local preview is available with:

```powershell
npm run preview
```

The server has no production build script. It can be started with Node directly, but a production process manager, HTTPS configuration, CORS configuration, cookie settings, and deployment instructions are not included in this repository and need confirmation/design before deployment.

## Deployment

No deployment configuration was found. There are no Vercel, Netlify, Render, Railway, Docker, Docker Compose, AWS, Azure, GCP, or Firebase Hosting manifests.

A likely deployment would require:

- Hosting the built Vite client as static assets.
- Hosting the Express server as a Node.js service.
- Setting the server and client environment variables in the host dashboard.
- Replacing the hardcoded client API URL.
- Updating server CORS to the deployed client origin.
- Enabling secure cookies and HTTPS.
- Allowing the deployed server's IP or network access in MongoDB Atlas.
- Configuring Firebase authorized domains and Razorpay production credentials.

The specific provider and commands are not defined by the current repository.

## Features by Area

### Interview experience

- Role and experience selection.
- Technical and HR modes.
- Five questions generated from candidate context.
- Timed answers with automatic submission when the timer reaches zero.
- Typed or browser speech-recognized answers.
- Browser-spoken questions and feedback.
- Difficulty badge and score-based adaptive difficulty.

### Resume and ATS

- PDF upload limited by Multer to 5 MB.
- PDF text extraction on the server.
- OpenRouter structured resume parsing.
- Local ATS score from 0 to 100 using keyword density, technical skills, formatting, impact metrics, links, and word count.
- ATS strengths, missing items, and suggestions displayed in setup.

### Reports and history

- Overall score out of 10.
- Confidence, communication, and correctness averages.
- Question-level feedback.
- Score trend chart.
- Difficulty distribution in the in-session report response.
- Downloadable PDF report.
- Stored interview history.

### Credits and payments

- New users receive 100 credits by default.
- Interview creation costs 50 credits.
- Pricing UI offers free, starter, and pro plans.
- Paid plans create Razorpay orders and add credits after server-side signature verification.

## Important Files

| File | Purpose |
| --- | --- |
| [client/src/App.jsx](client/src/App.jsx) | Client routes, user bootstrap, local server URL |
| [client/src/main.jsx](client/src/main.jsx) | React, router, and Redux entry point |
| [client/src/pages/Auth.jsx](client/src/pages/Auth.jsx) | Google sign-in flow |
| [client/src/components/Step1SetUp.jsx](client/src/components/Step1SetUp.jsx) | Interview setup, resume upload, ATS UI, question-generation request |
| [client/src/components/Step2Interview.jsx](client/src/components/Step2Interview.jsx) | Timed interview, voice APIs, answer submission |
| [client/src/components/Step3Report.jsx](client/src/components/Step3Report.jsx) | Analytics UI and PDF report generation |
| [client/src/pages/InterviewHistory.jsx](client/src/pages/InterviewHistory.jsx) | History list |
| [client/src/pages/InterviewReport.jsx](client/src/pages/InterviewReport.jsx) | Fetches a stored report |
| [client/src/pages/Pricing.jsx](client/src/pages/Pricing.jsx) | Credit plans and Razorpay Checkout |
| [client/src/utils/firebase.js](client/src/utils/firebase.js) | Firebase initialization |
| [server/index.js](server/index.js) | Express startup, CORS, middleware, route mounting |
| [server/controllers/interview.controller.js](server/controllers/interview.controller.js) | Main interview and resume business logic |
| [server/controllers/auth.controller.js](server/controllers/auth.controller.js) | Google user lookup/creation and JWT cookie |
| [server/controllers/payment.controller.js](server/controllers/payment.controller.js) | Razorpay order and signature verification |
| [server/services/openRouter.service.js](server/services/openRouter.service.js) | OpenRouter API wrapper |
| [server/services/razorpay.service.js](server/services/razorpay.service.js) | Razorpay SDK initialization |
| [server/utils/atsScoreCalculator.js](server/utils/atsScoreCalculator.js) | Deterministic ATS calculation |
| [server/middlewares/isAuth.js](server/middlewares/isAuth.js) | JWT cookie verification |
| [server/middlewares/multer.js](server/middlewares/multer.js) | Temporary PDF upload storage and 5 MB limit |
| [server/models/user.model.js](server/models/user.model.js) | User schema |
| [server/models/interview.model.js](server/models/interview.model.js) | Interview and embedded question schema |
| [server/models/payment.model.js](server/models/payment.model.js) | Payment schema |

## Common Errors and Troubleshooting

### MongoDB authentication failure

`bad auth` means Atlas rejected the database username or password. Reset the Atlas database-user password, update `MONGODB_URL`, and URL-encode special characters in the password.

### MongoDB DNS or network failure

`querySrv ENOTFOUND` indicates the Atlas SRV hostname could not be resolved. Copy the connection string again from Atlas, check DNS/VPN settings, and verify the cluster is available. A server-selection error can also mean the current IP is not allowed in Atlas Network Access.

### Server starts on the wrong port

The server defaults to port `6000`, but the client calls `http://localhost:8000`. Set `PORT=8000` in `server/.env`, or update the hardcoded `ServerUrl` in `client/src/App.jsx` and the CORS origin as appropriate.

### CORS or cookie failures

The server only allows `http://localhost:5173` and requests must include credentials. Confirm the Vite URL, `withCredentials: true`, the API port, and the browser's cookie settings.

### Google sign-in fails

Check `VITE_FIREBASE_APIKEY`, Firebase Google provider settings, and authorized domains. The client Firebase configuration is partly hardcoded in `client/src/utils/firebase.js`.

### OpenRouter errors

Check `OPENROUTER_API_KEY`, model availability, account credits, network access, and the server log. Resume parsing and answer evaluation expect valid JSON from the model; malformed output produces a server error.

### Resume upload errors

The endpoint expects a multipart field named `resume`, accepts the client PDF picker, and Multer limits the file to 5 MB. Confirm that `server/public` exists and is writable.

### Speech input is unavailable

`webkitSpeechRecognition` is browser-dependent. Use a Chromium-based browser or type the answer manually. Speech synthesis voices also depend on the operating system/browser.

### Razorpay checkout fails

Check both server Razorpay secrets and `VITE_RAZORPAY_KEY_ID`. Confirm that the Razorpay checkout script in `client/index.html` loads and that the server can create and verify orders.

### Vite lint/build failures

Run the client commands separately:

```powershell
cd client
npm run lint
npm run build
```

The repository currently contains no server lint, build, or test script.


## Security Notes

- Never commit `server/.env`, `client/.env`, API keys, database passwords, JWT secrets, or Razorpay secrets.
- The root `.gitignore` excludes `server/.env`, `client/.env`, and `node_modules/`; the nested ignore files also exclude local environment files and build artifacts.
- `OPENROUTER_API_KEY`, `JWT_SECRET`, `MONGODB_URL`, and `RAZORPAY_KEY_SECRET` are server-only secrets.
- The client must receive only public Firebase/Razorpay values prefixed with `VITE_`.
- Resume files are written temporarily to `server/public` and removed after analysis or error cleanup. Do not treat that directory as permanent private storage.
- `isAuth` protects most user data routes with a JWT cookie. The report controller does not visibly check that the requested interview belongs to `req.userId`; ownership authorization should be reviewed before production use.
- `createOrder` accepts `amount` and `credits` from the client. Production code should validate plan IDs and prices server-side rather than trusting client values.
- The JWT cookie currently uses `secure: false`; production should use HTTPS and secure cookie settings.
- CORS is restricted to the local Vite origin, which must be changed carefully for deployment.
- User-provided resume text and answer content are included in AI prompts. Add appropriate size, abuse, and prompt-injection controls before exposing the service publicly.



