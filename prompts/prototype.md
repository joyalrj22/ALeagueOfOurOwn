# Project: Generic League Management MVP (Serverless)

## System Overview
Build a full-stack MVP using React (Frontend) and Netlify Functions (Backend). 
The system must be a generic "League Engine" where admins define scoring rules 
and users view results. No persistence required; use a mock data module.

## Tech Stack
- Frontend: React, Tailwind CSS, Lucide-react (icons).
- Backend: Netlify Functions (Node.js/Vanilla JS).
- Auth: JWT-based mock authentication.

## Core Data Models (Mock)
- **League**: { id, name, inviteCode, adminId, scoringConfig: { type: 'match' | 'rank', pointsPerWin: 3, etc } }
- **Entry**: { id, leagueId, userId, scoreData: {}, timestamp }
- **Member**: { userId, leagueId, role: 'admin' | 'member' }

## Functional Requirements
1. **Auth**: `POST /login` returns a JWT. `POST /join` accepts an invite code.
2. **League Creation**: Admin defines name and scoring rules (e.g., "Points for 1st place" or "Points for Win").
3. **RBAC**: Only admins can `POST /score`. Everyone in the league can `GET /table`.
4. **Generic Scoring**: The system must calculate a "League Table" by iterating through entries and applying the `scoringConfig`.
5. **UI**: 
   - A Dashboard showing "My Leagues".
   - A League View with a Leaderboard.
   - Admin-only "Enter Score" form that adapts to the league type.

## Technical Constraints
- **Optimistic UI**: Implement React Query or basic state-cloning to show score updates immediately.
- **RESTful**: Netlify Functions should follow `/functions/league-handler.js` patterns.
- **Mock Persistence**: Create a `mockData.js` file that acts as a singleton for the session.

## Prompt Instruction
Generate the project structure. Start with the API contract for `GET /league/:id/table` 
that calculates rankings on-the-fly based on the generic rules. Then, provide 
the React components for the Admin Score Entry and the Leaderboard. Make sure you have clear directory structure - i would prefer a project root level api layer, service layer and repo layer for the backend.