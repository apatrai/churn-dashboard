# 🚀 Churn Dashboard Quick Fix Reference

## 🔧 Most Common Fixes (90% of issues)

### 1. **Tailwind CSS Not Working**
```bash
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
echo "SKIP_PREFLIGHT_CHECK=true" > .env
npm start
```

### 2. **Blank Page / Errors**
```javascript
// In browser console (F12):
localStorage.clear()
location.reload()
```

### 3. **React Logo Still Showing**
```bash
# In Claude Code:
cat src/App.tsx  # Check if it imports ChurnDashboard
# If not, manually edit App.tsx
```

### 4. **Files Not Creating (Write() issue)**
```bash
# Always start with:
cd C:\Users\work\churn-dashboard
pwd  # Must show churn-dashboard folder
```

## 📋 Before Starting Any Claude Code Session

```bash
cd C:\Users\work\churn-dashboard
cat .claude-context
pwd
npm start
```

## 🛠️ Nuclear Options

### Complete Dependency Reset:
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Complete Cache Clear:
```bash
rm -rf node_modules/.cache
rm -rf .cache
localStorage.clear()  # In browser
npm start
```

## 🎯 Prevention Checklist

- [ ] Always use exact dependency versions
- [ ] Always cd to project directory first
- [ ] Always verify App.tsx imports ChurnDashboard
- [ ] Always add SKIP_PREFLIGHT_CHECK to .env
- [ ] Always clear localStorage if seeing old data

## 📞 If All Else Fails

1. Close all terminals and browsers
2. Delete node_modules
3. Start fresh with exact versions from specs
4. Use incognito browser window