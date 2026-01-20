# Gbru - Modern E-commerce Website

A complete, modern e-commerce website built with React.js featuring all essential shopping functionalities.

## Features

### 🛍️ Core E-commerce Features
- **Product Catalog** - Browse products with filtering and search
- **Shopping Cart** - Add, remove, and update quantities
- **User Authentication** - Login and signup functionality
- **Checkout Process** - Multi-step checkout with shipping and payment
- **User Account** - Profile management, order history, and saved addresses

### 🎨 Modern Design
- **Responsive Design** - Works on all devices
- **Smooth Animations** - CSS animations and transitions
- **Modern UI** - Clean, professional interface
- **Easy Navigation** - Intuitive user experience

### 📱 Components Included
- Navbar with search and cart
- Hero section with features
- Product categories grid
- Product listing with filters
- Shopping cart sidebar
- Login/Signup forms
- User account dashboard
- Multi-step checkout
- Footer with links

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Navigate to `http://localhost:3000`
   - The website will automatically open

## Project Structure

```
├── App.jsx                 # Main app component
├── App.css                 # All styles
├── components/
│   ├── Navbar.jsx         # Navigation bar
│   ├── Hero.jsx           # Hero section
│   ├── Categories.jsx     # Product categories
│   ├── Products.jsx       # Product listing
│   ├── Cart.jsx           # Shopping cart
│   ├── Login.jsx          # Authentication
│   ├── Account.jsx        # User account
│   ├── Checkout.jsx       # Checkout process
│   └── Footer.jsx         # Footer
├── index.html             # HTML template
├── main.jsx              # React entry point
└── package.json          # Dependencies

```

## How It Works

### State Management
- Uses React hooks (useState) for simple state management
- Cart items stored in App component state
- User authentication state managed globally

### Navigation
- Simple page routing using conditional rendering
- No external router needed - perfect for beginners

### Beginner-Friendly Code
- Clean, readable component structure
- Well-commented code
- Simple prop passing
- Easy to understand logic

## Customization

### Adding Products
Edit the `products` array in `App.jsx`:
```javascript
const products = [
  { 
    id: 1, 
    name: 'Product Name', 
    price: 99.99, 
    image: 'image-url', 
    category: 'category-name' 
  },
  // Add more products...
];
```

### Styling
All styles are in `App.css` - modify colors, fonts, and layouts easily.

### Features
Each component is independent - add or remove features by editing components.

## Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast development server
- **CSS3** - Modern styling with animations
- **HTML5** - Semantic markup

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use for learning and projects!

---

**Perfect for beginners learning React and e-commerce development!** 🚀
