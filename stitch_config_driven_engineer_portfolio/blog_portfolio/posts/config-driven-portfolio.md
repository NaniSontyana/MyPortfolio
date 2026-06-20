# Building a Config-Driven Developer Portfolio

In this article, we'll discuss the design decisions, architecture, and developer experience (DX) of creating a **configuration-driven portfolio system**. 

Traditional developer portfolios are often hardcoded HTML/CSS templates or built using complex static site frameworks (like Next.js or Astro) that require local code execution to make any edits. A config-driven architecture solves this by separating **content** from **presentation**, enabling dynamic changes through a single text file or a web-based editor without sacrificing compilation-level optimizations.

## 1. Core Architecture

The architecture of our config-driven portfolio relies on three pillars:

1.  **The Single Source of Truth (`portfolio_content_config.txt`):** A single JSON-like configuration file that stores all profile details, social handles, statistics, project lists, and skills.
2.  **Modular HTML Templates (`home_portfolio`, `about_portfolio`, etc.):** Page templates written in semantic HTML/CSS that define layout structures, animations, and custom styling tokens.
3.  **The Stitch Compiler (`stitch.js`):** A lightweight build script that reads the configuration, evaluates replacements between designated comments (e.g. `<!-- STITCH_PROJECTS_START -->`), and rewrites the final static HTML files.

```javascript
// Simplified stitch compilation step
function compile() {
  const config = parseConfig();
  const html = fs.readFileSync('about_portfolio/code.html', 'utf8');
  
  const updatedHtml = html.replace(
    /<!-- STITCH_TITLE_START -->[\s\S]*?<!-- STITCH_TITLE_END -->/,
    `<!-- STITCH_TITLE_START -->\n<title>${config.personalInfo.name} | About</title>\n<!-- STITCH_TITLE_END -->`
  );
  
  fs.writeFileSync('about_portfolio/code.html', updatedHtml);
}
```

## 2. Incorporating a CMS

To eliminate the need for editing configuration files in a terminal, we added a secure web-based Content Management System (CMS) directly inside the settings page of the portfolio:

*   **Security Lock:** Administrative features are protected by an administrative passcode hash matched using timing-safe comparisons (`crypto.timingSafeEqual`).
*   **Live Form Editor:** Form controls load values dynamically from `window.PORTFOLIO_CONFIG` and let you modify sections (general information, skills, projects, and experiences).
*   **One-click compilation:** Saving changes sends a POST request to `/api/save-config` on the dev server, which updates `portfolio_content_config.txt`, triggers `compile()`, and reloads the page.

## 3. Advantages of This Approach

*   **Zero Database Overhead:** Everything is stored inside flat text files in the project workspace, meaning it can be easily checked into Git, and requires no database setup or third-party SaaS CMS subscriptions.
*   **Static Performance:** Since pages compile into standard static HTML, CSS, and vanilla JS, loading speeds are blisteringly fast (First Contentful Paint < 0.40 seconds) and rank high on SEO.
*   **Ultimate Flexibility:** Styling remains highly custom since we use native CSS variables coupled with utility classes.

This portfolio itself is compiled using this system! Feel free to click on the **Settings** tab in the top navigation menu to launch the CMS editor and play with it!
