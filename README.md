# demo-copilot-pb-jan2026

## File Navigation System

A simple, web-based file navigation system that allows users to browse, create, and manage files and folders.

### Features

- 📁 **Browse Files and Folders**: Navigate through a hierarchical folder structure
- ➕ **Create Items**: Add new files and folders
- 🗑️ **Delete Items**: Remove selected files and folders
- 🧭 **Breadcrumb Navigation**: Quickly navigate to parent folders
- 🎨 **Modern UI**: Clean and responsive design
- 📱 **Mobile Friendly**: Works on all devices

### Usage

1. Open `index.html` in a web browser
2. Use the toolbar buttons to:
   - **New Folder**: Create a new folder in the current directory
   - **New File**: Create a new file in the current directory
   - **Delete**: Remove the selected file or folder
3. **Single click** on an item to select it
4. **Double click** on a folder to navigate into it
5. **Double click** on a file to open it (shows an alert in this demo)
6. Use the **breadcrumb** at the top to navigate to parent folders

### File Structure

```
demo-copilot-pb-jan2026/
├── index.html       # Main HTML structure
├── styles.css       # Styling and layout
├── script.js        # File navigation logic
└── README.md        # Documentation
```

### Technical Details

- **Pure JavaScript**: No external dependencies required
- **In-memory Storage**: File structure is stored in memory (resets on page reload)
- **Responsive Design**: Grid layout adapts to different screen sizes
- **Modern CSS**: Uses CSS Grid, Flexbox, and modern properties

### Sample Directory Structure

The application comes pre-populated with a sample directory structure:
- Documents/
  - Resume.pdf
  - Notes.txt
- Pictures/
  - Photo1.jpg
  - Photo2.jpg
- Projects/ (empty)
- README.md

### Browser Compatibility

Works in all modern browsers that support ES6+ JavaScript and CSS Grid.