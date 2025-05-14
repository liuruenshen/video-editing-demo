Clips Editing Demo

## Prerequisites

- Node.js >= 20.x

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Technical Choices:

- Next.js: A highly popular React framework for building server-rendered applications, seamlessly integrating with React 19, the latest React framework version.
  The reason I choose next.js is that I can focus on implementing features and not on the configuration. I don't have to worry about bundler configuration, routing, code splitting, or server-side rendering. Next.js handles all of that for me, allowing me to focus on building my application.

- Tailwind CSS: A utility-first CSS framework that allows for rapid UI development with a focus on responsiveness and customization.
  The reasone I choose tailwind CSS is that it provides the following benefits:

  - Framework Agnostic: Tailwind CSS is not tied to any specific framework or library, making it easy to integrate with various projects.
  - Customization: Tailwind CSS is highly customizable, allowing developers to create unique designs without being constrained by predefined styles.
  - Responsive Design: Tailwind CSS provides built-in responsive design utilities, making it easy to create layouts that work well on different screen sizes.

- TypeScript: A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
  The reason I choose TypeScript is that it provides the following benefits:
  - Type Safety: TypeScript's static typing helps catch errors at compile time, reducing runtime errors and improving code reliability.
  - Enhanced IDE Support: TypeScript offers better autocompletion, navigation, and refactoring capabilities in modern IDEs, making development more efficient.
  - Improved Documentation: Type annotations serve as documentation, making it easier for developers to understand the codebase and its intended usage.
