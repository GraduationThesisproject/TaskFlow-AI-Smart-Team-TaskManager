# 🧪 Mobile Components Testing Guide

This guide will help you test all the mobile components we've created for the TaskFlow app.

## 🚀 Quick Start

### 1. Start the Development Server
```bash
cd apps/mobile
npm start
```

### 2. Open the App
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

### 3. Navigate to Test Screens
- **Main Test Screen**: First tab - Socket and Redux testing
- **Components Test Screen**: Second tab - All UI components
- **Font Test Screen**: Available via navigation

## 📱 Test Screens Overview

### 🏠 Main Index Screen (`index.tsx`)
**Location**: First tab in the app

**Features to Test**:
- ✅ **Theme System**: Toggle between light/dark themes
- ✅ **Color Tokens**: See all semantic colors in action
- ✅ **Typography**: Test all font styles and sizes
- ✅ **Redux Store**: Test API calls and state management
- ✅ **Socket Connections**: Test real-time communication
- ✅ **Navigation**: Quick access to Components Test screen

**How to Test**:
1. Toggle theme button to see color changes
2. Press API test buttons to see Redux in action
3. Test socket connections and see real-time messages
4. Click "Open Components Test Screen" button

### 🧪 Components Test Screen (`components-test.tsx`)
**Location**: Second tab in the app

**Features to Test**:
- ✅ **Themed Components**: Text, View, Card, Button variants
- ✅ **Common Components**: ErrorBoundary, LoadingSpinner, EmptyState, ConfirmationDialog
- ✅ **Form Components**: FormField, InputField with validation
- ✅ **Card Components**: TaskCard with all features
- ✅ **Auth Components**: LoginForm with OAuth options
- ✅ **Debug Components**: SocketStatus indicators

**How to Test**:
1. **Themed Components**: Press different button variants
2. **Loading Spinner**: Click "Show Loading Spinner" button
3. **Confirmation Dialog**: Click "Show Confirmation Dialog" button
4. **Error Boundary**: Click "Test Error Boundary" button
5. **Form Validation**: Try submitting empty forms
6. **Task Card**: Tap and long-press the task card
7. **Login Form**: Test form validation and OAuth buttons

### 🔤 Font Test Screen (`FontTest.tsx`)
**Location**: Available via navigation

**Features to Test**:
- ✅ **Custom Fonts**: Inter, Poppins, JetBrains Mono
- ✅ **Font Weights**: Light, Regular, Medium, Bold, etc.
- ✅ **Font Sizes**: Different text sizes and styles
- ✅ **Typography System**: Consistent text styling

## 🎯 Component-Specific Testing

### 🎨 Themed Components

**Test Cases**:
```tsx
// Test Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>

// Test Card component
<Card>
  <Text>Card content with shadows</Text>
</Card>
```

**What to Look For**:
- ✅ Colors change with theme toggle
- ✅ Proper contrast ratios
- ✅ Consistent spacing
- ✅ Touch feedback

### 🔧 Common Components

**ErrorBoundary Test**:
1. Click "Test Error Boundary" button
2. Click "Throw Error" button inside
3. Verify error fallback UI appears
4. Test "Try Again" and "Report Issue" buttons

**LoadingSpinner Test**:
1. Click "Show Loading Spinner" button
2. Verify overlay appears with spinner
3. Wait for auto-dismiss (2 seconds)
4. Test different spinner sizes

**ConfirmationDialog Test**:
1. Click "Show Confirmation Dialog" button
2. Test both "Yes, Proceed" and "Cancel" buttons
3. Verify modal closes properly
4. Check console logs for actions

**EmptyState Test**:
1. Scroll to EmptyState component
2. Click "Create Task" button
3. Verify action callback works

### 📝 Form Components

**FormField Test**:
1. Try submitting empty required fields
2. Test email validation
3. Test password length validation
4. Verify error messages appear
5. Test helper text display

**InputField Test**:
1. Test different keyboard types
2. Test secure text entry
3. Test auto-capitalization
4. Test multiline input
5. Test max length restrictions

### 🃏 Card Components

**TaskCard Test**:
1. **Tap**: Verify onPress callback
2. **Long Press**: Verify onLongPress callback
3. **Status Colors**: Check different status colors
4. **Priority Colors**: Check different priority colors
5. **Tags**: Verify tag display and overflow
6. **Assignee**: Check avatar and name display
7. **Due Date**: Verify date formatting

### 🔐 Auth Components

**LoginForm Test**:
1. **Empty Submission**: Test validation errors
2. **Invalid Email**: Test email format validation
3. **Short Password**: Test password length validation
4. **Valid Data**: Test successful submission
5. **OAuth Buttons**: Test Google and GitHub buttons
6. **Forgot Password**: Test forgot password link
7. **Sign Up**: Test sign up link

### 🐛 Debug Components

**SocketStatus Test**:
1. **Connected State**: Verify green status indicator
2. **Connecting State**: Verify yellow status indicator
3. **Error State**: Verify red status indicator
4. **Connection Count**: Check counter display
5. **Namespace**: Verify namespace display

## 🎨 Theme Testing

### Color System Test
1. Toggle between light and dark themes
2. Verify all components adapt properly
3. Check contrast ratios are maintained
4. Test semantic color tokens

### Typography Test
1. Verify custom fonts load correctly
2. Test different font weights
3. Check responsive font sizing
4. Verify consistent text styling

### Spacing Test
1. Check consistent margins and padding
2. Verify component spacing
3. Test responsive spacing

## 🔍 Debugging Tips

### Console Logs
- All component interactions log to console
- Check for error messages
- Verify callback functions work

### React DevTools
- Install React DevTools for debugging
- Inspect component props and state
- Check theme context values

### Performance Testing
- Test component rendering performance
- Check for memory leaks
- Verify smooth animations

## 🚨 Common Issues

### Import Errors
```bash
# If you see import errors, check:
1. File paths are correct
2. TypeScript types are properly defined
3. All dependencies are installed
```

### Theme Issues
```bash
# If theme isn't working:
1. Verify ThemeProvider wraps the app
2. Check useThemeColors hook usage
3. Verify color tokens are defined
```

### Component Not Rendering
```bash
# If component doesn't show:
1. Check component is properly exported
2. Verify props are correct
3. Check for runtime errors
```

## 📊 Testing Checklist

### ✅ Core Functionality
- [ ] All components render without errors
- [ ] Theme switching works properly
- [ ] Touch interactions respond correctly
- [ ] Form validation works as expected

### ✅ Visual Design
- [ ] Colors match design system
- [ ] Typography is consistent
- [ ] Spacing follows guidelines
- [ ] Shadows and effects work

### ✅ User Experience
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Empty states guide users
- [ ] Navigation is intuitive

### ✅ Performance
- [ ] Components render quickly
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive design

## 🎉 Success Criteria

Your components are working correctly when:

1. **All test screens load without errors**
2. **Theme switching works smoothly**
3. **All interactive elements respond properly**
4. **Form validation provides clear feedback**
5. **Error boundaries catch and handle errors**
6. **Loading states provide good UX**
7. **Components look consistent across devices**

## 📚 Next Steps

After testing:

1. **Document any issues** you find
2. **Create additional test cases** for edge cases
3. **Optimize performance** if needed
4. **Add accessibility features** (screen readers, etc.)
5. **Create automated tests** using Jest/React Native Testing Library

---

**Happy Testing! 🧪✨**
