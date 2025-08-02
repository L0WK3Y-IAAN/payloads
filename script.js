class GitHubFileViewer {
    constructor() {
        // Configuration - UPDATE THESE VALUES FOR YOUR REPOSITORY
        this.username = 'YOUR_USERNAME';  // Replace with your GitHub username
        this.repository = 'YOUR_REPO';    // Replace with your repository name
        this.folder = 'src';              // Folder to display files from
        
        this.initializeElements();
        this.loadFiles();
    }
    
    initializeElements() {
        this.loading = document.getElementById('loading');
        this.fileGrid = document.getElementById('fileGrid');
        this.error = document.getElementById('error');
    }
    
    async loadFiles() {
        try {
            const files = await this.fetchFiles();
            this.renderFiles(files);
            this.showFileGrid();
        } catch (error) {
            console.error('Error loading files:', error);
            this.showError();
        }
    }
    
    async fetchFiles() {
        // First, get the repository tree
        const treeUrl = `https://api.github.com/repos/${this.username}/${this.repository}/git/trees/main`;
        const treeResponse = await fetch(treeUrl);
        
        if (!treeResponse.ok) {
            throw new Error('Failed to fetch repository tree');
        }
        
        const treeData = await treeResponse.json();
        
        // Find the folder
        const folder = treeData.tree.find(item => item.path === this.folder && item.type === 'tree');
        
        if (!folder) {
            throw new Error(`Folder "${this.folder}" not found`);
        }
        
        // Get the folder contents
        const folderResponse = await fetch(folder.url);
        const folderData = await folderResponse.json();
        
        // Filter only files (not subdirectories)
        const files = folderData.tree.filter(item => item.type === 'blob');
        
        return files;
    }
    
    renderFiles(files) {
        if (files.length === 0) {
            this.fileGrid.innerHTML = '<div class="error"><p>No files found in the folder.</p></div>';
            return;
        }
        
        this.fileGrid.innerHTML = '';
        
        files.forEach(file => {
            const fileElement = this.createFileElement(file);
            this.fileGrid.appendChild(fileElement);
        });
        
        // Update title with file count
        const title = document.querySelector('h1');
        title.textContent = `Files in ${this.folder}/ (${files.length} file${files.length !== 1 ? 's' : ''})`;
    }
    
    createFileElement(file) {
        const fileName = file.path;
        const extension = this.getFileExtension(fileName);
        const category = this.getFileCategory(extension);
        
        const fileRow = document.createElement('div');
        fileRow.className = 'file-row';
        
        fileRow.innerHTML = `
            <div class="file-icon ${category}">
                ${this.getFileIcon(category)}
            </div>
            <div class="file-details">
                <div class="file-name">${fileName}</div>
                <div class="file-info">
                    <span class="file-extension">${extension}</span>
                    <span class="file-size">Click to view</span>
                </div>
            </div>
            <div class="file-actions">
                <a href="https://github.com/${this.username}/${this.repository}/blob/main/${this.folder}/${fileName}" 
                   target="_blank" class="view-btn">View on GitHub</a>
                <a href="https://raw.githubusercontent.com/${this.username}/${this.repository}/main/${this.folder}/${fileName}" 
                   target="_blank" class="download-btn">Raw File</a>
            </div>
        `;
        
        // Add click event to open file
        fileRow.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-btn') && !e.target.classList.contains('download-btn')) {
                window.open(`https://github.com/${this.username}/${this.repository}/blob/main/${this.folder}/${fileName}`, '_blank');
            }
        });
        
        return fileRow;
    }
    
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    getFileCategory(extension) {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
        const codeExts = ['html', 'css', 'js', 'php', 'py', 'java', 'cpp', 'c', 'json'];
        
        if (imageExts.includes(extension)) return 'image';
        if (videoExts.includes(extension)) return 'video';
        if (documentExts.includes(extension)) return 'document';
        if (codeExts.includes(extension)) return 'code';
        return 'other';
    }
    
    getFileIcon(category) {
        const icons = {
            'image': '🖼️',
            'video': '🎥',
            'document': '📄',
            'code': '💻',
            'other': '📁'
        };
        return icons[category] || icons['other'];
    }
    
    showFileGrid() {
        this.loading.style.display = 'none';
        this.fileGrid.style.display = 'flex';
        this.error.style.display = 'none';
    }
    
    showError() {
        this.loading.style.display = 'none';
        this.fileGrid.style.display = 'none';
        this.error.style.display = 'block';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GitHubFileViewer();
});
