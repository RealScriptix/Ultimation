# Fins - Short Video Sharing Web App 🌊

> **A modern TikTok-like short video sharing platform built for the web with responsive design and smooth animations**

[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-brightgreen)](https://your-username.github.io/fins)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-orange)](https://developers.google.com/web/fundamentals/design-and-ux/responsive)

## 🌊 Live Demo
Visit the live app: **[https://your-username.github.io/fins](https://your-username.github.io/fins)**

## ✨ Features

### 🎯 Core Swipe Functionality
- **Swipe Right** → Like/Unlike video with heart animation
- **Swipe Left** → Go to next video 
- **Swipe Down** → View creator's channel profile
- **Swipe Up** → Go to previous video
- **Double Tap** → Like video with floating heart
- **Single Tap** → Pause/Play video
- **Keyboard Controls** → Arrow keys and spacebar support

### 📱 Device Support
- ✅ **Mobile** - Touch gestures with haptic feedback
- ✅ **Tablet** - Optimized for medium screens
- ✅ **Desktop** - Mouse controls and keyboard shortcuts
- ✅ **Progressive Web App** - Install on home screen
- ✅ **Offline Support** - Service worker caching

### 🎨 Modern UI/UX
- **Dark Theme** - Optimized for video content
- **Smooth Animations** - 60fps transitions and micro-interactions
- **Responsive Design** - Looks great on all screen sizes
- **Accessibility** - Screen reader and keyboard support
- **Performance** - Optimized loading and smooth scrolling

### 🎵 Video Features
- **Auto-play** - Seamless video experience
- **Progress Bar** - Visual playback progress
- **Video Counter** - Current video position
- **Like Animations** - Beautiful heart animations
- **Pause Indicator** - Clear playback state

### 👤 User Profiles
- **Avatar & Username** - Creator identification
- **Video Descriptions** - Rich text support
- **Hashtags** - Clickable tags with colors
- **Social Actions** - Like, comment, share, save

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Visit your site** at `https://your-username.github.io/fins`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/fins.git
cd fins

# Serve locally (any method works)
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000

# Then visit: http://localhost:8000
```

## 📱 Installation as PWA

### Mobile (Android/iOS)
1. Open the app in your mobile browser
2. Tap the browser menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. Enjoy the native app experience!

### Desktop (Chrome/Edge)
1. Visit the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

## 🎮 Controls

### Touch/Mobile
| Gesture | Action |
|---------|--------|
| Swipe Right → | Like video |
| Swipe Left ← | Next video |
| Swipe Down ↓ | View profile |
| Swipe Up ↑ | Previous video |
| Single Tap | Play/Pause |
| Double Tap | Like video |

### Desktop/Keyboard
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Like video |
| `←` | Next video |
| `↓` | View profile |
| `↑` | Previous video |
| `L` | Toggle like |

## 🛠️ Technical Features

### Built With
- **HTML5** - Modern semantic markup
- **CSS3** - Advanced animations and responsive design
- **Vanilla JavaScript** - No frameworks, pure performance
- **Service Worker** - Offline support and caching
- **PWA Manifest** - App-like installation

### Performance
- **🚀 Fast Loading** - Optimized assets and code
- **⚡ Smooth Animations** - 60fps transitions
- **📱 Mobile Optimized** - Touch-friendly interactions
- **🔄 Efficient Caching** - Service worker implementation
- **🎯 SEO Ready** - Proper meta tags and structure

### Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile Safari
- ✅ Chrome Mobile

## 🎨 Customization

### Colors & Theming
The app uses CSS custom properties for easy customization:

```css
:root {
  --primary: #ff0066;        /* Main brand color */
  --secondary: #00d4ff;      /* Accent color */
  --background: #000;        /* Background color */
  --text-primary: #ffffff;   /* Primary text */
  --text-secondary: #cccccc; /* Secondary text */
}
```

### Adding Videos
Update the `videos` array in `index.html`:

```javascript
const videos = [
  {
    id: 1,
    url: 'path/to/your/video.mp4',
    user: { username: 'creator_name', avatar: '🌊' },
    description: 'Amazing video description! ✨',
    hashtags: ['#fins', '#amazing', '#video'],
    likes: 1200,
    comments: 89,
    shares: 45,
    category: 'entertainment'
  },
  // Add more videos...
];
```

## 📊 Analytics & Insights

The app includes built-in analytics tracking:
- **User Interactions** - Swipes, likes, shares
- **Video Performance** - Views, engagement rates
- **User Behavior** - Watch time, completion rates
- **Device Data** - Screen sizes, platforms

## 🔧 Configuration

### Environment Setup
No build process required! Simply edit `index.html` for:
- Video data sources
- API endpoints
- Analytics tracking
- Social sharing

### PWA Configuration
Edit `manifest.json` to customize:
- App name and description
- Theme colors
- App icons
- Display mode

## 🚢 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your app will be live at `https://username.github.io/repository-name`

### Other Platforms
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect GitHub repository
- **Firebase Hosting**: Use Firebase CLI
- **Surge.sh**: `surge` command in project folder

## 🎯 Roadmap

### Planned Features
- [ ] User authentication
- [ ] Video upload functionality
- [ ] Comments system
- [ ] User profiles
- [ ] Search and discovery
- [ ] Real-time notifications
- [ ] Video effects and filters
- [ ] Social sharing integration

### Current Status
- [x] Core swipe gestures
- [x] Responsive design
- [x] PWA support
- [x] Smooth animations
- [x] Cross-device compatibility
- [x] Offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by TikTok's user experience
- Built with modern web standards
- Optimized for all devices and platforms

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/fins/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/fins/discussions)
- **Email**: fins.support@example.com

---

**Made with ❤️ for the modern web** | **[Live Demo](https://your-username.github.io/fins)** | **[Download PWA](https://your-username.github.io/fins)**