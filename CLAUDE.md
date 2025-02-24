# Orthodox-Lofi Project Guidelines

## Build Commands
- `deno task start` - Start development server with file watching
- `deno task check` - Run formatter, linter, and type checking
- `deno task build` - Build the project
- `deno task preview` - Preview production build

## Code Style
- **Imports**: Use absolute imports from `deno.json` imports map. Order: Deno/Fresh first, third-party next, then local modules.
- **Types**: Always use explicit type annotations for function parameters, return types, and state variables.
- **Components**: Use functional components with Preact hooks. Island components for interactive elements.
- **Naming**: PascalCase for components, camelCase for variables, functions and instances. Use descriptive names.
- **Error Handling**: Use try/catch for async operations. Provide user-friendly fallbacks.
- **Audio Processing**: Implement each audio effect as a separate class/file in the utils directory.
- **Comments**: Use JSDoc for classes and public methods. Keep comments focused on "why" not "what".

## Project Structure
- `islands/` - Interactive client-side components
- `components/` - Shared UI components
- `routes/` - Server-rendered pages
- `utils/` - Audio processing and helper functions
- `static/` - Static assets including audio files