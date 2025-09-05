# 🧪 TaskFlow Mobile Implementation Testing Guide

## 🚀 Quick Start Commands

### For Windows:
```bash
# Run the development environment
start-dev.bat
```

### For Mac/Linux:
```bash
# Make script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Start (Alternative):
```bash
# Terminal 1 - Backend
cd apps/main
npm run dev

# Terminal 2 - Mobile
cd apps/mobile
npm start
```

## 📱 Testing Checklist

### ✅ 1. Basic App Launch
- [ ] App launches without crashes
- [ ] No "Element type is invalid" errors
- [ ] Theme loads correctly (dark/light mode)
- [ ] All components render properly

### ✅ 2. Navigation Testing
- [ ] Hamburger menu (☰) opens sidebar
- [ ] Sidebar slides in/out smoothly
- [ ] All navigation items are clickable:
  - [ ] Home (Dashboard)
  - [ ] Analytics
  - [ ] Workspaces
  - [ ] Templates
  - [ ] Settings
- [ ] Navigation closes sidebar after selection
- [ ] No "screen doesn't exist" errors

### ✅ 3. Dashboard Screen (Home)
- [ ] Welcome header displays user name
- [ ] 4 stats cards show:
  - [ ] Total Tasks
  - [ ] In Progress
  - [ ] High Priority
  - [ ] Overdue
- [ ] Workspaces section displays recent workspaces
- [ ] Upcoming Deadlines section shows tasks
- [ ] Pull-to-refresh works
- [ ] Loading states display correctly
- [ ] Error states handle gracefully

### ✅ 4. Analytics Screen
- [ ] Task overview stats display
- [ ] Completion rate progress bar works
- [ ] Performance metrics show data
- [ ] Recent activity feed displays
- [ ] Data loads from Redux store
- [ ] Pull-to-refresh functionality
- [ ] Loading and error states

### ✅ 5. Workspaces Screen
- [ ] Workspace overview stats
- [ ] List of workspaces with details
- [ ] Workspace badges (Public/Private, Active/Archived)
- [ ] Member count and creation date
- [ ] Quick action buttons
- [ ] Empty state when no workspaces
- [ ] Redux integration working

### ✅ 6. Templates Screen
- [ ] Template overview stats
- [ ] Category filters display
- [ ] Template list with details
- [ ] Template badges (Public/Private, Active/Inactive)
- [ ] Task count and creation date
- [ ] Quick action buttons
- [ ] Empty state when no templates
- [ ] Redux integration working

### ✅ 7. Redux Integration
- [ ] Data fetches on screen load
- [ ] Loading states show during fetch
- [ ] Error states display on failure
- [ ] Pull-to-refresh triggers new fetch
- [ ] Data persists between navigation
- [ ] No Redux errors in console

### ✅ 8. Theming System
- [ ] Dark mode works correctly
- [ ] Light mode works correctly
- [ ] Theme persists between app sessions
- [ ] All components use themed colors
- [ ] No hardcoded colors visible
- [ ] Theme switching is smooth

### ✅ 9. UI/UX Testing
- [ ] All touch interactions work
- [ ] ScrollView scrolls smoothly
- [ ] Cards have proper shadows/borders
- [ ] Text is readable in both themes
- [ ] Icons display correctly
- [ ] Responsive design works on different screen sizes
- [ ] No layout overflow issues

### ✅ 10. Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Loading states prevent multiple requests
- [ ] Error boundaries catch component errors
- [ ] Graceful fallbacks for missing data
- [ ] No app crashes on errors

## 🔍 Debug Information

### Backend API Endpoints to Test:
```
GET /api/health - Health check
GET /api/workspaces - Fetch workspaces
GET /api/analytics - Fetch analytics data
GET /api/templates - Fetch templates
```

### Mobile App URLs:
```
http://localhost:8081 - Expo dev server
http://localhost:19002 - Expo DevTools
```

### Common Issues & Solutions:

#### ❌ "Element type is invalid" Error
- **Cause**: Mixed imports of themed vs non-themed components
- **Solution**: Ensure all components use `@/components/Themed` imports

#### ❌ "Screen doesn't exist" Error
- **Cause**: Incorrect route paths in Sidebar
- **Solution**: Use `/(tabs)/screen-name` format for routes

#### ❌ Data Not Loading
- **Cause**: Backend not running or API connection issues
- **Solution**: Check backend is running on port 3000

#### ❌ Theme Not Working
- **Cause**: ThemeProvider not wrapping app
- **Solution**: Verify ThemeProvider is in root layout

#### ❌ Redux Errors
- **Cause**: Incorrect selector usage or missing data
- **Solution**: Check Redux DevTools and selector paths

## 📊 Performance Testing

### Memory Usage:
- [ ] No memory leaks during navigation
- [ ] Images load efficiently
- [ ] Redux state doesn't grow indefinitely

### Network Performance:
- [ ] API calls complete within reasonable time
- [ ] Pull-to-refresh is responsive
- [ ] Loading states appear quickly

### UI Performance:
- [ ] Smooth animations (sidebar slide)
- [ ] No lag during scrolling
- [ ] Touch responses are immediate

## 🎯 Success Criteria

Your implementation is successful if:
1. ✅ All screens load without errors
2. ✅ Navigation works seamlessly
3. ✅ Data loads from backend via Redux
4. ✅ Theming system works correctly
5. ✅ All UI components are functional
6. ✅ Error handling is robust
7. ✅ Performance is smooth
8. ✅ No console errors or warnings

## 🚨 If Issues Found

1. **Check Console Logs**: Look for error messages
2. **Verify Backend**: Ensure API is running and accessible
3. **Check Network**: Verify mobile app can reach backend
4. **Review Redux**: Check if data is being fetched correctly
5. **Test Components**: Verify individual components work in isolation

## 📝 Notes

- Test on both physical device and simulator
- Test in both light and dark themes
- Test with and without network connection
- Test with empty data states
- Test with error conditions

---

**Happy Testing! 🎉**
