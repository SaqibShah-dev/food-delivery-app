# Contributing to Food Delivery App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and grow
- Report issues constructively

---

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/your-username/food-delivery-app.git
cd food-delivery-app
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Set Up Development Environment
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Making Changes

### Code Standards

#### TypeScript
- Use strict mode: `"strict": true` in tsconfig.json
- Avoid `any` type; use proper typing
- Define interfaces for complex objects

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Avoid
const user: any = {};
```

#### Variable Naming
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Use UPPER_SNAKE_CASE for constants

```typescript
const userName = "John";
class UserService {}
type UserType = { name: string };
const DEFAULT_PORT = 5000;
```

#### Comments
- Write comments for "why", not "what"
- Keep comments up-to-date with code changes

```typescript
// Good
// Cache results for 5 minutes to reduce database queries
const cachedData = cache.get('key') || fetchFromDB();

// Avoid
// Get data from database
const data = fetchFromDB();
```

### Backend Changes

#### Adding an API Endpoint
1. Create controller method in `src/controllers/`
2. Create route in `src/routes/`
3. Add Zod schema validation in `src/types/`
4. Implement service logic in `src/services/`

```typescript
// Controller
export const getFood = asyncHandler(async (req, res) => {
  const food = await FoodService.getFoodById(req.params.id);
  return res.json(new ApiResponse(200, food, "Food fetched"));
});

// Route
router.get('/:id', getFood);

// Type/Validation
const FoodIdSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID")
});

// Service
export const getFoodById = async (id: string) => {
  return await FoodItem.findById(id);
};
```

#### Writing Database Queries
- Use async/await syntax
- Implement proper error handling
- Use TypeScript types for query results

```typescript
async function getUserWithOrders(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const orders = await Order.find({ userId });
    return { user, orders };
  } catch (error) {
    logger.error("Database error:", error);
    throw error;
  }
}
```

### Frontend Changes

#### Creating a Component
1. Create component file: `src/components/[category]/ComponentName.tsx`
2. Create styles: `src/components/[category]/ComponentName.module.css`
3. Export from index: `src/components/[category]/index.ts`

```typescript
// ComponentName.tsx
import styles from './ComponentName.module.css';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

#### API Calls
- Keep API calls in `src/services/`
- Use axios or fetch with proper error handling
- Type all responses with TypeScript

```typescript
// src/services/foodService.ts
export const getFoodItems = async () => {
  const response = await fetch(`${API_URL}/api/food`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json() as Promise<FoodResponse>;
};
```

---

## Testing

### Before Submitting a PR

#### Backend
```bash
cd backend
npm run lint      # Check for linting issues
npm run build     # Verify TypeScript compilation
npm test          # Run test suite
```

#### Frontend
```bash
cd frontend
npm run lint      # Check for linting issues
npm run build     # Verify build succeeds
npm test          # Run test suite (if available)
```

### Writing Tests

#### Backend Test Example
```typescript
// src/services/__tests__/food.service.test.ts
describe('FoodService', () => {
  it('should fetch food items', async () => {
    const foods = await FoodService.getAllFoods();
    expect(foods).toBeInstanceOf(Array);
  });

  it('should handle not found error', async () => {
    await expect(FoodService.getFoodById('invalid-id'))
      .rejects.toThrow('Food not found');
  });
});
```

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
