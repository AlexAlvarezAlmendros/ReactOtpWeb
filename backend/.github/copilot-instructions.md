# Copilot Instructions for OtpWebBack

## Overview
OtpWebBack is a Node.js-based API project that provides CRUD operations for four main resources: Releases, Artists, Events, and Studios. The API is structured around RESTful principles and uses Express.js for routing.

## Architecture
- **Controllers**: Located in the `controllers/` directory, these files handle the business logic for each resource.
  - Example: `artistController.js` contains functions for managing artist data.
- **Models**: Located in the `models/` directory, these files define the data structure for each resource.
  - Example: `Artist.js` defines the schema for artist data.
- **Routes**: Located in the `routes/` directory, these files map HTTP methods and endpoints to controller functions.
  - Example: `artistRoutes.js` maps `/api/artists` endpoints to `artistController.js` functions.

## Developer Workflows
### Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node index.js
   ```

### Testing
- No explicit testing framework is mentioned. Add tests in a `tests/` directory if needed.

### Debugging
- Use `console.log` statements or integrate a debugger like `node-inspect`.

## Project-Specific Conventions
- **Routing**: All routes are prefixed with `/api`. Example: `/api/releases`.
- **Error Handling**: Ensure all controller functions handle errors gracefully and return appropriate HTTP status codes.
- **Data Validation**: Add validation logic in controllers or middleware.

## Integration Points
- **Database**: No database integration is mentioned. If added, update models and controllers accordingly.
- **External APIs**: No external API integrations are mentioned.

## Examples
### Adding a New Resource
1. Create a new model in `models/`.
2. Create a new controller in `controllers/`.
3. Create a new route file in `routes/` and map endpoints to controller functions.
4. Update `index.js` to include the new route.

### Example Route
```javascript
const express = require('express');
const router = express.Router();
const { getArtists, createArtist } = require('../controllers/artistController');

router.get('/', getArtists);
router.post('/', createArtist);

module.exports = router;
```

## Notes
- Follow RESTful principles for all endpoints.
- Keep controllers focused on business logic and avoid mixing concerns.
- Use middleware for cross-cutting concerns like authentication or logging.
