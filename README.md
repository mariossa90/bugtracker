# 🐛 BugTracker - Monday.com Bug Tracking Application

A modern bug tracking application built with Nuxt.js that integrates with Monday.com for seamless project management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Monday.com API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mariossa90/bugtracker.git
cd bugtracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
MONDAY_API_KEY=your_monday_api_key_here
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running!

## 📦 Tech Stack

- **Framework:** [Nuxt.js 3](https://nuxt.com/)
- **UI Library:** [PrimeVue](https://primevue.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Icons:** [PrimeIcons](https://primevue.org/icons/)
- **Charts:** [Chart.js](https://www.chartjs.org/)
- **Integration:** Monday.com API

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate static site
npm run generate
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

This project is optimized for Vercel deployment. Follow these steps:

1. **Quick Start:** See [`VERCEL_QUICK_START.md`](./VERCEL_QUICK_START.md) for 5-minute setup
2. **Detailed Guide:** See [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md) for comprehensive instructions

**Key Steps:**
1. Push your code to GitHub (already done! ✓)
2. Import project on [Vercel](https://vercel.com)
3. Add `MONDAY_API_KEY` environment variable
4. Deploy!

Your app will be live at: `https://your-project.vercel.app`

### Environment Variables

Required environment variables for deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONDAY_API_KEY` | Your Monday.com API authentication key | ✅ Yes |

⚠️ **Never commit API keys to Git!** Use environment variables or Vercel's secret management.

## 📁 Project Structure

```
bugtracker/
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components
│   ├── BugsQueueBoard.vue
│   └── settings/
├── composables/         # Composable functions
├── pages/              # Application pages (routes)
├── server/
│   └── api/            # API endpoints
│       └── monday/     # Monday.com integration
├── stores/             # Pinia state stores
├── nuxt.config.ts      # Nuxt configuration
├── tailwind.config.js  # Tailwind configuration
├── vercel.json         # Vercel deployment config
└── package.json        # Project dependencies
```

## 🔑 Features

- 🐛 Bug tracking and management
- 📊 Integration with Monday.com boards
- 🎨 Modern, responsive UI with PrimeVue
- ⚡ Server-side rendering (SSR) for better performance
- 🔒 Secure API key management
- 📱 Mobile-friendly design
- 🌙 Dark mode support

## 🔧 Configuration

### Nuxt Configuration
Main configuration file: `nuxt.config.ts`

Key configurations:
- PrimeVue theme customization
- Tailwind CSS integration
- Pinia store setup
- Runtime configuration for API keys

### Monday.com Integration
API routes are located in `server/api/monday/`
- Handles authentication
- Manages board data
- Processes task information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🔗 Links

- **Repository:** [github.com/mariossa90/bugtracker](https://github.com/mariossa90/bugtracker)
- **Nuxt Docs:** [nuxt.com/docs](https://nuxt.com/docs)
- **PrimeVue Docs:** [primevue.org](https://primevue.org)
- **Monday.com API:** [monday.com/developers](https://monday.com/developers)

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the deployment guides in this repository

---

**Built with ❤️ using Nuxt.js and Monday.com API**
