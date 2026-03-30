# Project Overview
The end goal is to create a full stack application that can be used to manage a league of any kind. Users should be able to create their own leagues (manaing their league with admin privileges), whilst also retaining the ability to join leagues created by other users. The league roster, scoring system and all other attributes of the league can be defined flexibly by the admin. Leagues can be made either publicly or privately accessible. If you have access to a league, you will be able to view the current and previous league standings as well as projected performances + additional analytics. 

# Tech Stack
- Frontend: React, Tailwind CSS, Lucide-react (icons).
- Backend: Netlify Functions (Node.js/Vanilla JS).
- Database: MySQL
- Auth: JWT-based mock authentication.

## Core Data Models
- **League**: { id, name, inviteCode, type }
- **Season**: {id, name, leagueId}
- **Member**: {userId, leagueId}
- **Game**: {id, date, seasonId}
- **GameResult**: {id, gameId, userId, score}

# Architecture: Service-Oriented (SOA)
The backend is structured as a series of microservices accessible through a **Public API Gateway**. This allows for modular development and independent scaling of league features.

### Services & Responsibilities
- **Public API Gateway**: Acts as the single entry point for all frontend requests. Handles routing, global validation, and request orchestration.
- **Auth Service**: Manages user identity, JWT-based mock authentication, and session handling.
- **League Creator Service**: Manages the lifecycle of a league, including initial setup, metadata updates, and configuration of scoring rules.
- **Registration Service**: Handles user enrollment into leagues, invite code generation, and validation.
- **Competition Service**: Manages the active list of members (roster) and is responsible for recording/updating game results and participation data.
- **Scheduler Service**: Responsible for organizing seasons and generating game schedules/match timings.
- **Standings Service**: Calculates real-time league tables, user rankings, and overall performance metrics based on game results.
- **Analytics Service**: Provides advanced insights, historical trend analysis, and performance projections for players and leagues.

# Technical Constraints
- **Optimistic UI**: Implement basic state-cloning to show score updates immediately.
- **RESTful**
- **Persistence**: SQLite database (`league.db`) for local development, providing a stable schema for future MySQL migration.
