# CLAUDE.md

## Project Philosophy

**Yadot-Web** is a minimalist life visualization tool. The core principle is **extreme simplicity** - showing you've been alive for X days/weeks/years and nothing more.

## Design Principles

### Minimalism First
- **No visual clutter** - The interface should be clean, centered, and distraction-free
- **No unnecessary features** - Every element must justify its existence
- **No documentation spam** - Don't create README updates or docs unless explicitly requested
- **No feature creep** - Resist the urge to add "nice to have" features

### Configuration Philosophy
If configuration is needed, it should be:
- **Barely visible** - A subtle hamburger menu in a top corner (e.g., top-right)
- **Minimal options** - Only essential settings (e.g., date of birth management)
- **Non-intrusive** - Should not distract from the main content

### Visual Design
- **Centered layout** - All content centered vertically and horizontally
- **Generous whitespace** - Let the content breathe
- **Subtle interactions** - Hover states and transitions should be gentle
- **Accessibility always** - ARIA labels, keyboard navigation, semantic HTML

## Current Features (Keep Minimal)

1. **Date Display** - Today's day and date
2. **Life Metrics** - Days, weeks, and years alive (with decimal precision)
3. **Visual Charts** - Modal popups showing life expectancy dots
4. **Date of Birth** - Stored in cookies, editable via subtle button

## Configuration Strategy

If a hamburger menu is implemented:
- Position: **Top-right corner**, very small (e.g., 24x24px)
- Color: Subtle gray that blends in (`text-gray-400`)
- Menu contents (when opened):
  - Edit Date of Birth
  - (Future: Life expectancy adjustment?)
  - (Future: Theme toggle?)
- Animation: Smooth fade-in/slide-in
- Close on outside click and Escape key

## Tech Stack Constraints

- **Next.js 14** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **dayjs** for date calculations
- **Canvas API** for dot charts
- **js-cookie** for client-side storage
- **Docker** for deployment

## Code Style Guidelines

### Components
- Use functional components with hooks
- Memoize expensive components (e.g., `DotChart`)
- Keep components focused and single-purpose
- Use TypeScript for type safety

### State Management
- Use local state (useState) - no Redux/Zustand unless absolutely necessary
- Use cookies for persistence
- Environment variables for fallback defaults

### Styling
- Tailwind utility classes only
- No custom CSS unless absolutely required
- Responsive design (mobile-first)
- Dark mode support via Tailwind dark: variants

### Accessibility
- Proper ARIA labels on interactive elements
- Keyboard navigation support (Enter, Space, Escape)
- Focus states visible and clear
- Semantic HTML elements

## Anti-Patterns to Avoid

❌ Adding features "because they might be useful"
❌ Over-engineering with unnecessary abstractions
❌ Cluttering the UI with buttons and controls
❌ Adding animations that distract from content
❌ Creating multiple pages or routes
❌ Adding social sharing, analytics, or tracking
❌ Pop-ups, tooltips, or help text (unless critical)

## Future Considerations (Only if requested)

- **Custom life expectancy** - Allow users to adjust from default 90 years
- **Theme customization** - Color scheme options
- **Export functionality** - Download chart as image
- **Internationalization** - Multi-language support

## Development Workflow

1. **Read code first** - Always review existing files before modifying
2. **Minimal changes** - Only change what's necessary
3. **Test thoroughly** - Check keyboard navigation, mobile view, edge cases
4. **Security conscious** - Validate inputs, sanitize data, avoid XSS/injection
5. **No over-engineering** - Three similar lines > premature abstraction

## File Structure

```
src/
├── app/
│   ├── page.tsx          # Main application logic
│   ├── layout.tsx        # Root layout with fonts and metadata
│   └── globals.css       # Global Tailwind styles
└── components/
    └── DotChart.tsx      # Canvas-based life visualization
```

## Environment Variables

- `NEXT_PUBLIC_REFERENCE_DATE` - Fallback date of birth (format: YYYY-MM-DD)

## Docker Deployment

- Multi-architecture support (amd64, arm64)
- Published to Docker Hub as `bferg314/yadot-web:latest`
- Port 3000 exposed

## Versioning and Release Workflow

### Automated Releases

Every merge to `main` triggers an automated release process:

1. Commits are analyzed for conventional commit format
2. Version number is bumped automatically (semver)
3. CHANGELOG.md is updated with categorized changes
4. Git tag and GitHub release are created
5. Multi-arch Docker images are built and pushed to Docker Hub

### Conventional Commit Format

All commits **MUST** follow this format:

```
<type>(<optional-scope>): <description>
```

**Commit Types:**

- `feat:` - New feature (bumps minor version: 0.1.0 → 0.2.0)
- `fix:` - Bug fix (bumps patch version: 0.1.0 → 0.1.1)
- `chore:` - Maintenance (no version bump)
- `docs:` - Documentation (no version bump)
- `refactor:` - Code refactoring (no version bump)
- `test:` - Tests (no version bump)
- `ci:` - CI/CD changes (no version bump)

**Breaking Changes:**

- Add `!` after type: `feat!:` or `fix!:`
- Or add footer: `BREAKING CHANGE: description`
- This bumps major version: 0.1.0 → 1.0.0

**Examples:**

```bash
# Good commits
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve modal escape key issue"
git commit -m "chore: update dependencies"
git commit -m "feat(ui): improve accessibility"
git commit -m "feat!: redesign entire interface"

# Bad commits (avoid)
git commit -m "updates"
git commit -m "Fixed bug"  # Wrong: missing type, wrong case
git commit -m "add dark mode"  # Wrong: missing type
```

### Version Tags

Docker images are tagged with:

- `bferg314/yadot-web:vX.Y.Z` (specific version, e.g., v0.2.1)
- `bferg314/yadot-web:vX.Y` (minor version, e.g., v0.2)
- `bferg314/yadot-web:vX` (major version, e.g., v0)
- `bferg314/yadot-web:latest` (always latest release)

### Viewing Releases

- **GitHub Releases**: View all versions with detailed notes
- **CHANGELOG.md**: Complete version history in the repository
- **Git tags**: Run `git tag -l` to list all version tags
- **Docker Hub**: Tags page shows all published images

### Manual Triggers (if needed)

- GitHub Actions → Release → Run workflow
- GitHub Actions → Docker Build → Run workflow

---

**Remember**: When in doubt, do less. The goal is to show life metrics beautifully and get out of the way.
