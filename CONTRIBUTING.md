# Contributing to h4ppy p1zza Portfolio

First off, thank you for considering contributing to this project! 🎉

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Check if the issue already exists
- Include detailed steps to reproduce
- Include screenshots if applicable
- Specify your environment (OS, browser, Node version)

### Suggesting Enhancements

- Use the GitHub issue tracker
- Clearly describe the enhancement
- Explain why it would be useful
- Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (see commit conventions below)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Workflow

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/h4ppy-p1zza.com.git
cd h4ppy-p1zza.com

# Install dependencies
npm install

# Start development server
npm run dev
```

### Before Committing

```bash
# Run type check
npm run type-check

# Run linter
npm run lint

# Run formatter check
npm run format:check

# Fix linting issues
npm run lint:fix

# Fix formatting issues
npm run format
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode compliance
- Avoid `any` type - use proper types
- Use interfaces for object shapes
- Document complex types with comments

### React

- Use functional components with hooks
- Use `React.memo` for expensive components
- Use `useCallback` and `useMemo` appropriately
- Keep components focused and small (<300 lines)
- Extract reusable logic into custom hooks

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Use shadcn/ui components when available
- Maintain responsive design (mobile-first)
- Respect theme variables in theme.css

### File Organization

- One component per file
- Co-locate related components
- Use meaningful file and variable names
- Group imports logically (React, libraries, local)

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

```bash
feat(portfolio): add project search functionality
fix(blog): resolve date formatting issue
docs(readme): update installation instructions
style(ui): format button component with prettier
refactor(layout): extract header into separate component
perf(images): implement lazy loading
```

## Pull Request Process

1. **Update Documentation** - Update README.md if you change functionality
2. **Follow Code Style** - Ensure your code passes linting and formatting
3. **Test Your Changes** - Verify the app works in development and production
4. **Write Clear Descriptions** - Explain what and why in your PR description
5. **Reference Issues** - Link to related issues using `Fixes #123`
6. **Keep PRs Focused** - One feature/fix per PR
7. **Request Review** - Tag maintainers for review

## Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Focus on the code, not the person
- Suggest improvements, don't just criticize
- Approve when ready, request changes when needed
- Respond promptly to questions

### For Contributors

- Don't take feedback personally
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time
- Learn from the feedback

## Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main app
│   └── components/          # React components
│       ├── portfolio-layout.tsx
│       ├── blog-page.tsx
│       └── ui/             # UI components (shadcn/ui)
├── config/
│   └── env.ts              # Environment config
├── security/
│   └── csp.ts              # Security policies
└── styles/                 # Global styles
```

## Testing Guidelines

Currently, there are no automated tests. When contributing:

1. Manually test your changes
2. Test in different browsers
3. Test responsive design
4. Check console for errors
5. Verify no TypeScript errors

## Additional Notes

### Adding Dependencies

- Avoid adding new dependencies unless necessary
- Prefer lighter alternatives
- Check bundle size impact
- Ensure security (check npm audit)
- Document why the dependency is needed

### Performance

- Keep bundle size small
- Use lazy loading for large components
- Optimize images and assets
- Minimize re-renders
- Profile before and after changes

### Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow CSP guidelines
- Sanitize user input
- Keep dependencies updated

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Read the README.md thoroughly

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Help others learn
- Focus on constructive feedback
- No harassment or discrimination

---

Thank you for contributing! 🚀
