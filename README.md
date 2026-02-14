# GitSnap - GitHub Repository Card Generator

<div align="center">
  <img src="/public/vite.svg" alt="GitSnap Logo" width="100" />
  <h1>GitSnap</h1>
  <p><strong>Turn your code into a shareable masterpiece.</strong></p>
  <p>
    Create beautiful, high-fidelity screenshots of your GitHub repositories for social media, portfolios, and presentations.
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## Features

- **Beautiful Themes**: Choose from 16+ gradient themes including sleek dark modes and clean light modes.
- **Responsive Layouts**: Fully responsive design with specific layouts for:
  - **Horizontal (16:9)** - Perfect for Twitter/X & Presentations
  - **Square (1:1)** - Ideal for Instagram Feed
  - **Vertical (9:16)** - Optimized for Instagram Stories & TikTok
  - **Open Graph (1.91:1)** - Best for Link Previews
- **Editable Stats**: Manually customize Stars, Forks, and Watchers counts to showcase your project's potential.
- **Smart Preview**:
  - Live File Explorer view
  - Rendered Markdown README preview
  - Auto-detected language colors
- **Fast & Client-Side**: Generates images instantly in browser using `html-to-image`.
- **Adaptive UI**: Interface automatically adapts text and border colors based on the selected theme (Light/Dark).

## Demo

Try it out locally or deploy to your favorite static host!

1. Enter a GitHub repository URL (e.g., `github.com/dexccv/project-name`)
2. Click **Generate**
3. Customize themes, layout, and toggles
4. Click **Download Masterpiece**

## Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Variables, Flexbox, Grid)
- **Tooling**: [Vite](https://vitejs.dev/)
- **Libraries**:
  - `html-to-image`: High-quality DOM to Image conversion
  - `marked`: Fast Markdown parsing
  - `canvas-confetti`: Fun visual effects
  - `vscode-material-icon-theme`: Professional file icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dexccv/gitsnap.git
   cd gitsnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser** via `http://localhost:5173`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Credits

- Icons by [Feather Icons](https://feathericons.com/) and [VSCode Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme)
- Fonts: **Outfit** and **JetBrains Mono** via Google Fonts

---

<div align="center">
  <p>Made by <a href="https://github.com/dexccv" target="_blank">dexccv</a></p>
</div>
