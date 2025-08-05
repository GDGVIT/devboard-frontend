<p align="center">
<a href="https://dscvit.com">
	<img width="400" src="https://user-images.githubusercontent.com/56252312/159312411-58410727-3933-4224-b43e-4e9b627838a3.png#gh-light-mode-only" alt="GDSC VIT"/>
</a>
	<h2 align="center">DevBoard   </h2>
	<h4 align="center">A modern, feature-rich GitHub widget builder and portfolio dashboard. Create beautiful, interactive widgets for your GitHub profile, visualize stats, and showcase your work with premium design tools inspired by Figma, Notion, and Linear.<h4>
</p>

---
[![Join Us](https://img.shields.io/badge/Join%20Us-Developer%20Student%20Clubs-red)](https://dsc.community.dev/vellore-institute-of-technology/)
	
[![DOCS](https://img.shields.io/badge/Documentation-see%20docs-green?style=flat-square&logo=appveyor)](INSERT_LINK_FOR_DOCS_HERE) 
  [![UI ](https://img.shields.io/badge/User%20Interface-Link%20to%20UI-orange?style=flat-square&logo=appveyor)](INSERT_UI_LINK_HERE)

## Features
- [x] Premium Canvas Sizes: Presets and custom dimensions for widgets
- [x] Drag & Drop Elements: Text, images, containers, shapes, charts, progress bars, badges, buttons, QR codes
- [x] GitHub Data Integration: Live stats, profile info, avatar, commits, and more
- [x] Inline Editing: Double-click to edit text inline
- [x] Layer Management: Organize, lock/unlock, toggle visibility
- [x] Grid & Snap: Toggle grid, adjust size, snap-to-grid
- [x] Theme Switching: Dark/light canvas themes
- [x] SVG Export: Auto-generated, production-ready SVG code
- [x] Save & Privacy: Save widgets, set privacy, add tags
- [x] Undo/Redo: Robust history management


<br>
## Dependencies
- Node.js (v18+ recommended)
- npm or yarn
- Docker (optional)

## Dependencies
## Running

Clone the repository:
```bash
git clone https://github.com/NitinTheGreat/devboard-frontend.git
cd devboard-frontend/devboard
```

Install dependencies:
```bash
npm install
# or
yarn install
```

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Create a `.env.local` file in the `devboard` directory and set:
```
NEXT_PUBLIC_API_BASE_URL=<your-backend-api-url>
```
## Running

A sample `Dockerfile` is provided in `devboard/` for easy containerization:
```Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn install --frozen-lockfile || npm install
COPY . .
RUN yarn build || npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN yarn install --production --frozen-lockfile || npm install --production
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["yarn", "start"]
```


## Contributors


<table>
   <tr align="center">
	   <td>
	   Nitin Kumar Pandey
<!-- 	   <p align="center">
		   <img src = "https://media.licdn.com/dms/image/D4D03AQFQwQwQwQwQwQ/profile-displayphoto-shrink_200_200/0?e=1696464000&v=beta&t=QwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw" width="150" height="150" alt="Nitin Kumar Pandey">
	   </p> -->
		<p align="center">
			   <a href = "https://github.com/NitinTheGreat">
				   <img src = "http://www.iconninja.com/files/241/825/211/round-collaboration-social-github-code-circle-network-icon.svg" width="36" height = "36" alt="GitHub"/>
			   </a>
			   <a href = "https://www.linkedin.com/in/nitinkrpandey">
				   <img src = "http://www.iconninja.com/files/863/607/751/network-linkedin-social-connection-circular-circle-media-icon.svg" width="36" height="36" alt="LinkedIn"/>
			   </a>
		   </p>
	   </td>
   </tr>
</table>
			<img src = "https://dscvit.com/images/dsc-logo-square.svg" width="150" height="150" alt="Your Name Here (Insert Your Image Link In Src">
		</p>
  
		
	
</table>

<p align="center">
	Made with ❤ by <a href="https://dscvit.com">GDSC-VIT</a>
</p>
