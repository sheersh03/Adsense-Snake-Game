# Snake Game - Deployment Guide

## Overview
This Snake Game is now ready for deployment with Google AdSense monetization and enhanced UX.

## Features Implemented

### 1. **Google AdSense Integration**
- Auto Ads enabled via script in `<head>`
- Top banner responsive ad unit
- Sticky footer ad with close button
- Cookie consent banner (GDPR compliant)
- Privacy policy page
- `ads.txt` file for publisher verification

### 2. **Button Control Stability**
- Fixed button dimensions prevent layout shifts
- Smooth transitions and hover effects
- No vertical movement when buttons show/hide
- Touch-optimized for mobile devices
- Accessibility features (focus states, keyboard navigation)

### 3. **Game Features**
- Classic Snake gameplay on 20x20 grid
- Score tracking (10 points per food)
- Pause/Resume functionality
- Mobile touch controls
- Keyboard controls (Arrow keys or WASD)
- Game over screen with replay

## Pre-Deployment Checklist

### Step 1: Replace AdSense Placeholders
Open `index.html` and replace:
```
{{ADSENSE_PUB_ID}} → Your AdSense Publisher ID (e.g., ca-pub-1234567890123456)
{{AD_SLOT_TOP}} → Your top banner ad slot ID
{{AD_SLOT_STICKY}} → Your sticky footer ad slot ID
```

### Step 2: Update ads.txt
Open `ads.txt` and replace:
```
{{ADSENSE_PUB_ID}} → Your AdSense Publisher ID (same as above)
```

### Step 3: File Structure
Ensure all files are in the same directory:
```
snake-game/
├── index.html
├── style.css
├── script.js
├── privacy.html
└── ads.txt
```

### Step 4: Upload to Web Server
1. Upload all files to your web server root directory
2. Ensure `ads.txt` is accessible at: `https://yourdomain.com/ads.txt`
3. Test all pages load correctly

### Step 5: AdSense Verification
1. Submit your site to Google AdSense
2. Wait for approval (typically 1-3 days)
3. Verify ads are displaying correctly

## Technical Details

### Button Stability Features
- **Fixed Heights**: Game controls container maintains 52px height
- **Opacity Transitions**: Buttons fade in/out smoothly without layout shift
- **Position Strategy**: Hidden buttons use `position: absolute` to remove from layout
- **Flexbox Optimization**: Prevents flex container from collapsing

### Performance Optimizations
- Game runs at consistent 100ms (10 FPS) tick rate
- GPU-accelerated button transforms
- Optimized with `will-change` properties
- No performance impact from ads

### Mobile Optimizations
- `touch-action: manipulation` prevents double-tap zoom
- `-webkit-tap-highlight-color: transparent` removes iOS flash
- Responsive design for all screen sizes
- Mobile D-pad controls for touch devices

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## AdSense Compliance
✅ Cookie consent before showing ads
✅ Privacy policy with all disclosures
✅ Non-intrusive ad placements
✅ User control (close button on sticky ad)
✅ GDPR compliant
✅ Responsive ad units
✅ ads.txt file included

## Testing Checklist
- [ ] Replace all AdSense placeholders
- [ ] Test cookie banner (Accept/Decline)
- [ ] Test sticky ad close button
- [ ] Test all game buttons (no vertical movement)
- [ ] Test Start → Play → Pause → Resume → Game Over → Play Again flow
- [ ] Test keyboard controls (Arrow keys, WASD)
- [ ] Test mobile touch controls
- [ ] Verify ads.txt is accessible
- [ ] Test privacy policy link
- [ ] Test on mobile devices
- [ ] Test on different browsers

## Support & Issues
If you encounter any issues:
1. Clear browser cache
2. Check browser console for errors
3. Verify all placeholders are replaced
4. Ensure ads.txt is in root directory

## License
This is a free-to-use game template. Customize as needed.

## Version
Version 2.0 - Enhanced with AdSense and stable button controls
Last Updated: October 2024
