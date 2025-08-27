 # DevBoard Frontend

A modern, feature-rich GitHub widget builder and portfolio dashboard. DevBoard empowers developers to create beautiful, interactive widgets for their GitHub profiles, visualize stats, and showcase their work with premium design tools inspired by Figma, Notion, and Linear.

---

## 🚀 Features

### Widget Builder
- **Premium Canvas Sizes**: Choose from preset sizes (Badge, Stats Card, Banner, Square, Large Display) or set custom dimensions.
- **Drag & Drop Elements**: Add text, images, containers, shapes (rectangle, circle, triangle, star), charts, progress bars, badges, buttons, and QR codes.
- **GitHub Data Integration**: Fetch live GitHub stats (username, name, bio, followers, following, public repos, avatar, creation date, commits) and display them dynamically in widgets.
- **Inline Editing**: Double-click elements to edit text inline with a beautiful, responsive editor.
- **Layer Management**: Organize, lock/unlock, and toggle visibility for each element. View all layers in a sidebar.
- **Grid & Snap**: Toggle grid visibility, adjust grid size, and enable snap-to-grid for precise placement.
- **Theme Switching**: Instantly switch between dark and light canvas themes.
- **SVG Export**: Auto-generates production-ready SVG code for your widget. Copy to clipboard with one click.
- **Save & Privacy**: Save widgets to your dashboard, set them as private, and tag them for easy organization.
- **Undo/Redo**: Robust history management for all canvas actions.

### Portfolio Dashboard
- **Profile Integration**: Connect your GitHub account and display widgets on your portfolio page.
- **Widget Marketplace**: Discover, use, and remix widgets created by the community (coming soon).

### UI/UX
- **Modern Design**: Inspired by top design tools, with floating toolbars, draggable panels, and smooth transitions.
- **Accessibility**: Keyboard shortcuts for quick actions, responsive layout for all devices.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/NitinTheGreat/devboard-frontend.git
   cd devboard-frontend/devboard
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Run the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables
Create a `.env.local` file in the `devboard` directory and set:
```
NEXT_PUBLIC_API_BASE_URL=<your-backend-api-url>
```

---

## 🐳 Docker Deployment

A sample `Dockerfile` is provided for easy containerization. See below for details.

---

## 🧩 Project Structure

- `devboard/app/` — Next.js app routes and pages
- `devboard/components/` — UI components, widget builder, authentication, marketplace, etc.
- `devboard/lib/` — Utility functions, context, types
- `devboard/public/` — Static assets (SVGs, icons)
- `devboard/types/` — TypeScript types

---

## ✨ Contributing

We welcome contributions to DevBoard! To get started:

1. **Fork the repository** and create your branch:
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** (see `devboard/components/widget-builder/index.tsx` for main logic).
3. **Test locally** and ensure all features work as expected.
4. **Commit and push**:
   ```sh
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** on GitHub. Please describe your changes clearly and reference any related issues.

### Guidelines
- Write clean, readable code and follow the existing style.
- Document new features in the README if relevant.
- Add tests if possible.
- Be respectful and collaborative.

---

## 👤 Contributor

- **Nitin Kumar Pandey**  
  [LinkedIn](https://www.linkedin.com/in/nitinkrpandey)

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

## 💬 Questions & Support

For questions, suggestions, or support, please open an issue or reach out via [LinkedIn](https://www.linkedin.com/in/nitinkrpandey).

---

## 🐳 Dockerfile Example

See below for a ready-to-use Dockerfile to run DevBoard Frontend in a container.
