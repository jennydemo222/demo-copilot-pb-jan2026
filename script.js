// File Navigation System
class FileNavigator {
    constructor() {
        this.fileSystem = {
            name: 'Root',
            type: 'folder',
            path: '',
            children: [
                {
                    name: 'Documents',
                    type: 'folder',
                    path: 'Documents',
                    children: [
                        { name: 'Resume.pdf', type: 'file', path: 'Documents/Resume.pdf' },
                        { name: 'Notes.txt', type: 'file', path: 'Documents/Notes.txt' }
                    ]
                },
                {
                    name: 'Pictures',
                    type: 'folder',
                    path: 'Pictures',
                    children: [
                        { name: 'Photo1.jpg', type: 'file', path: 'Pictures/Photo1.jpg' },
                        { name: 'Photo2.jpg', type: 'file', path: 'Pictures/Photo2.jpg' }
                    ]
                },
                {
                    name: 'Projects',
                    type: 'folder',
                    path: 'Projects',
                    children: []
                },
                { name: 'README.md', type: 'file', path: 'README.md' }
            ]
        };
        
        this.currentPath = '';
        this.selectedItem = null;
        this.init();
    }
    
    init() {
        this.fileListElement = document.getElementById('fileList');
        this.breadcrumbElement = document.getElementById('breadcrumb');
        this.currentPathElement = document.getElementById('currentPath');
        
        document.getElementById('newFolderBtn').addEventListener('click', () => this.createNewFolder());
        document.getElementById('newFileBtn').addEventListener('click', () => this.createNewFile());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteSelected());
        
        this.render();
    }
    
    getCurrentFolder() {
        if (this.currentPath === '') {
            return this.fileSystem;
        }
        
        const parts = this.currentPath.split('/');
        let current = this.fileSystem;
        
        for (const part of parts) {
            current = current.children.find(item => item.name === part);
            if (!current) return this.fileSystem;
        }
        
        return current;
    }
    
    navigateToFolder(path) {
        this.currentPath = path;
        this.selectedItem = null;
        this.render();
    }
    
    createNewFolder() {
        const name = prompt('Enter folder name:');
        if (!name) return;
        
        const currentFolder = this.getCurrentFolder();
        
        // Check if folder already exists
        if (currentFolder.children.some(item => item.name === name)) {
            alert('An item with this name already exists!');
            return;
        }
        
        const newPath = this.currentPath ? `${this.currentPath}/${name}` : name;
        currentFolder.children.push({
            name: name,
            type: 'folder',
            path: newPath,
            children: []
        });
        
        this.render();
    }
    
    createNewFile() {
        const name = prompt('Enter file name:');
        if (!name) return;
        
        const currentFolder = this.getCurrentFolder();
        
        // Check if file already exists
        if (currentFolder.children.some(item => item.name === name)) {
            alert('An item with this name already exists!');
            return;
        }
        
        const newPath = this.currentPath ? `${this.currentPath}/${name}` : name;
        currentFolder.children.push({
            name: name,
            type: 'file',
            path: newPath
        });
        
        this.render();
    }
    
    deleteSelected() {
        if (!this.selectedItem) {
            alert('Please select a file or folder to delete.');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${this.selectedItem.name}"?`)) {
            return;
        }
        
        const currentFolder = this.getCurrentFolder();
        currentFolder.children = currentFolder.children.filter(
            item => item !== this.selectedItem
        );
        
        this.selectedItem = null;
        this.render();
    }
    
    selectItem(item) {
        this.selectedItem = item;
        this.render();
    }
    
    openItem(item) {
        if (item.type === 'folder') {
            this.navigateToFolder(item.path);
        } else {
            alert(`Opening file: ${item.name}\n\nIn a real application, this would open the file viewer.`);
        }
    }
    
    renderBreadcrumb() {
        const parts = this.currentPath ? this.currentPath.split('/') : [];
        let html = '<span class="breadcrumb-item" data-path="">🏠 Home</span>';
        
        let accumulatedPath = '';
        parts.forEach((part, index) => {
            accumulatedPath += (index > 0 ? '/' : '') + part;
            html += '<span class="breadcrumb-separator">›</span>';
            html += `<span class="breadcrumb-item" data-path="${accumulatedPath}">${part}</span>`;
        });
        
        this.breadcrumbElement.innerHTML = html;
        
        // Add click handlers to breadcrumb items
        this.breadcrumbElement.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const path = e.target.getAttribute('data-path');
                this.navigateToFolder(path);
            });
        });
    }
    
    render() {
        const currentFolder = this.getCurrentFolder();
        
        // Update breadcrumb
        this.renderBreadcrumb();
        
        // Update current path display
        this.currentPathElement.textContent = this.currentPath || 'Root';
        
        // Sort items: folders first, then files
        const sortedChildren = [...currentFolder.children].sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'folder' ? -1 : 1;
        });
        
        // Render file list
        if (sortedChildren.length === 0) {
            this.fileListElement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📂</div>
                    <div class="empty-state-text">This folder is empty</div>
                </div>
            `;
            return;
        }
        
        this.fileListElement.innerHTML = sortedChildren.map(item => {
            const icon = item.type === 'folder' ? '📁' : '📄';
            const selectedClass = item === this.selectedItem ? 'selected' : '';
            return `
                <div class="file-item ${item.type} ${selectedClass}" data-path="${item.path}">
                    <div class="file-icon">${icon}</div>
                    <div class="file-name">${item.name}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        this.fileListElement.querySelectorAll('.file-item').forEach(element => {
            const path = element.getAttribute('data-path');
            const item = sortedChildren.find(i => i.path === path);
            
            element.addEventListener('click', (e) => {
                if (e.detail === 1) {
                    // Single click - select
                    this.selectItem(item);
                }
            });
            
            element.addEventListener('dblclick', () => {
                // Double click - open
                this.openItem(item);
            });
        });
    }
}

// Initialize the file navigator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileNavigator();
});
