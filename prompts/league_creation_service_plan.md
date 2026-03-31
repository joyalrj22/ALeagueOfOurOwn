# League Creator Service Implementation Plan

This plan outlines the full-stack implementation of the **League Creator Service**, divided into three distinct workstreams for specialized agents.

## User Review Required

> [!IMPORTANT]
> The implementation relies on the existing `mockData.js` singleton for state persistence during the session. All agents must ensure they are interacting with the repository layer rather than modifying `mockData` directly where possible.

> [!NOTE]
> We will use a mock "user-1" as the default admin for league creation until the Auth Service is fully integrated.

## Proposed Changes

### 1. Service + Repo Layer (Agent A)
Responsible for the core business logic of creating a league and updating the mock database.

#### [MODIFY] [league-repository.js](file:///c:/Users/Administrator/ALeagueOfOurOwn/repositories/league-repository.js)
- Add `createLeague(leagueData)` method.
- Add `addMember(memberData)` method.

#### [NEW] [league-creator-service.js](file:///c:/Users/Administrator/ALeagueOfOurOwn/services/league-creator-service.js)
- Implement `createLeague(name, scoringConfig, adminId)`.
- Logic for generating unique `inviteCode`.
- Orchestrate league creation and initial admin membership.

---

### 2. API Layer (Agent B)
Responsible for the Netlify Function that exposes the service to the frontend.

#### [NEW] [leagues.js](file:///c:/Users/Administrator/ALeagueOfOurOwn/api/leagues.js)
- Endpoint: `POST /api/leagues`.
- Input validation (Schema check for name and scoringConfig).
- Integration with `leagueCreatorService`.
- Standardized JSON responses (201 Created, 400 Bad Request).

---

### 3. Frontend Layer (Agent C)
Responsible for the user interface and interaction.

#### [NEW] [LeagueCreator.jsx](file:///c:/Users/Administrator/ALeagueOfOurOwn/ui/src/components/LeagueCreator.jsx)
- Interactive form with dynamic scoring configuration.
- Premium UI/UX (Glassmorphism, smooth transitions).
- Integration with the `/api/leagues` endpoint.
- Success state displaying the new league's invite code.

## Agent Prompts

I have prepared three specific prompts to be used for each branch of work:

### Prompt 1: Service + Repo Layer
```markdown
Context: We are building the League Creator Service for 'A League Of Our Own'.
Task: 
1. Update 'repositories/league-repository.js' to include:
   - 'createLeague(leagueData)': adds a league to 'mockData.leagues' and returns it.
   - 'addMember(memberData)': adds a member to 'mockData.members'.
2. Create 'services/league-creator-service.js' with a 'createLeague' method that:
   - Takes 'name', 'scoringConfig', and 'adminId'.
   - Generates a unique 'id' and a 6-character alphanumeric 'inviteCode'.
   - Calls the repository to save the league.
   - Calls the repository to add the 'adminId' as the first member with role 'admin'.
   - Returns the created league object.
```

### Prompt 2: API Layer
```markdown
Context: We are building the League Creator Service for 'A League Of Our Own'.
Task:
1. Create a Netlify function 'api/leagues.js' to handle 'POST' requests.
2. The endpoint should:
   - Expect a JSON body: { name, scoringConfig }.
   - Assume 'user-1' as the adminId for now.
   - Validate that 'name' is a string and 'scoringConfig' is a valid object.
   - Import and call 'leagueCreatorService.createLeague'.
   - Return 201 with the league data on success.
   - Return 400 with a descriptive error message on failure.
```

### Prompt 3: Frontend Layer
```markdown
Context: We are building the League Creator Service for 'A League Of Our Own'.
Task:
1. Create a 'LeagueCreator' React component in 'ui/src/components/'.
2. Design a premium, high-fidelity form that allows users to:
   - Enter a League Name.
   - Choose Scoring Type: 'Match-based' (Win/Loss/Draw points) or 'Rank-based' (Point map for ranks 1-N).
   - Dynamically adjust input fields based on the selected type.
3. Features:
   - Form validation.
   - Loading state during submission.
   - Success view showing the League Name and Invite Code.
4. Styling: Use Vanilla CSS + Tailwind. Aim for a 'wow' factor (gradients, backdrop-blur, subtle animations).
```

## Verification Plan

### Automated Tests
- Test the API endpoint using `curl` or Postman.
- Verify `mockData.js` state change after creation.

### Manual Verification
- Walk through the creation flow in the browser.
- Verify that the new league appears in the internal data structure.
