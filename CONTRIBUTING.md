# Contributing Guide

Thanks for helping improve the project.

## Code of Conduct

- be respectful and constructive
- keep feedback focused on the code and the problem
- document decisions that affect the application workflow
- avoid committing secrets or environment-specific credentials

## Development Workflow

### 1. Fork and clone the repository

```bash
git clone https://github.com/SaqibShah-dev/food-delivery-app.git
cd food-delivery-app
```

### 2. Create a feature branch

```bash
git checkout -b feature/my-change
```

Recommended branch prefixes:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for cleanup and restructure

### 3. Install project dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Configure your local environment

Create a `backend/.env` file using the values from [Readme.md](Readme.md). Do not commit this file.

## Coding Standards

### TypeScript

- prefer explicit types for request, response, and service data
- keep business logic in service files instead of controllers when possible
- avoid using `any` unless there is no safer type available

### Naming

- use `camelCase` for variables and functions
- use `PascalCase` for classes and interfaces
- use `UPPER_SNAKE_CASE` for constants

### Backend conventions

- keep route definitions in `backend/src/routes/`
- handle request validation in controllers or middleware
- put shared business logic in `backend/src/services/`
- keep response formatting consistent with the helper in `backend/src/utils/apiResponse.ts`

### Frontend conventions

- keep API logic in `frontend/src/services/`
- organize UI by component or page feature area
- keep styles close to the component or page that uses them

## Validation Before Opening a PR

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

## Pull Request Expectations

Before submitting a pull request:

- make sure the change has been tested locally
- update the relevant documentation if the behavior or API changes
- keep the scope narrow and focused
- explain the rationale and impact in the PR description

## Documentation Updates

When you change an API contract or local workflow, update the relevant docs:

- [Readme.md](Readme.md)
- [API.md](API.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Commit Guidelines

### Commit Message Format
```
type(scope): subject

body

footer
```

Examples:
- `feat(auth): add JWT refresh token functionality`
- `fix(food): handle missing image gracefully`
- `docs(readme): add API documentation`
- `refactor(service): extract common logic into utils`
- `test(orders): add integration tests`

### Good Commit Practices
- Keep commits small and focused
- One feature per commit
- Write descriptive commit messages
- Reference issues: `Fixes #123`

---

## Pull Request Process

### Before Creating PR
- [ ] Code follows project style guides
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Changes are documented in code comments
- [ ] Branch is up-to-date with main

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
How to test these changes

## Screenshots (if UI changes)
[Add screenshots here]

## Checklist
- [ ] Code review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process
1. Maintainers review your PR
2. Address review comments
3. Push updates to the same branch
4. PR is merged when approved

---

## Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Add code comments for complex logic
- Update API.md for endpoint changes
- Add JSDoc comments for functions

### JSDoc Example
```typescript
/**
 * Fetches food items with optional filters
 * @param query - Search query string
 * @param category - Food category filter
 * @param limit - Maximum number of results
 * @returns Promise resolving to array of FoodItems
 * @throws Error if database query fails
 */
export async function getFoods(
  query?: string,
  category?: string,
  limit: number = 20
): Promise<FoodItem[]> {
  // implementation
}
```

---

## Performance Guidelines

### Backend
- Use database indexes for frequently queried fields
- Implement pagination for large result sets
- Cache expensive operations
- Use connection pooling

### Frontend
- Lazy load components with React.lazy()
- Optimize images and assets
- Use React.memo for expensive components
- Minimize bundle size

---

## Security Guidelines

- Never commit API keys or secrets
- Validate and sanitize all user input
- Use environment variables for configuration
- Implement proper authentication checks
- Use HTTPS in production
- Sanitize error messages (don't expose stack traces)

---

## Common Issues & Solutions

### Merge Conflicts
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts manually
git add .
git rebase --continue
```

### Local Changes Stash
```bash
git stash          # Save changes
git stash list     # View stashed changes
git stash pop      # Restore changes
```

### Need to Update Branch
```bash
git fetch origin
git rebase origin/main
# or
git merge origin/main
```

---

## Questions or Need Help?

- Check existing GitHub issues
- Review project documentation
- Ask in pull request comments
- Reach out to maintainers

---

## Recognition

Contributors will be recognized in:
- Project CONTRIBUTORS.md file
- GitHub contributors page
- Release notes (for significant contributions)

Thank you for contributing! 🎉
