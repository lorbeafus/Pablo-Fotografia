// Import Firebase modules
import { auth, storage, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    listAll,
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc,
    query,
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== STATE MANAGEMENT =====
let currentCategory = 'bodas';
let selectedFiles = [];
let currentUser = null;

// ===== DOM ELEMENTS =====
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const previewArea = document.getElementById('previewArea');
const previewGrid = document.getElementById('previewGrid');
const uploadBtn = document.getElementById('uploadBtn');
const cancelBtn = document.getElementById('cancelBtn');
const fileCount = document.getElementById('fileCount');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const gallery = document.getElementById('gallery');
const emptyGallery = document.getElementById('emptyGallery');
const currentCategorySpan = document.getElementById('currentCategory');
const imageCountSpan = document.getElementById('imageCount');
const loadingOverlay = document.getElementById('loadingOverlay');
const categoryTabs = document.querySelectorAll('.tab-btn');

// ===== AUTHENTICATION =====
// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        showAdminPanel(user);
    } else {
        currentUser = null;
        showLoginScreen();
    }
});

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        loginError.classList.remove('show');
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error.code));
    } finally {
        showLoading(false);
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
});

function showAdminPanel(user) {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    userEmail.textContent = user.email;
    loadGallery();
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminPanel.style.display = 'none';
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
    };
    return messages[errorCode] || 'Error al iniciar sesión';
}

// ===== CATEGORY MANAGEMENT =====
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update current category
        currentCategory = tab.dataset.category;
        updateCategoryDisplay();
        
        // Clear selected files
        clearSelectedFiles();
        
        // Load gallery for new category
        loadGallery();
    });
});

function updateCategoryDisplay() {
    const categoryNames = {
        'bodas': 'Bodas',
        '15años': '15 Años',
        'vistas': 'Vistas',
        'books': 'Books'
    };
    currentCategorySpan.textContent = categoryNames[currentCategory];
}

// ===== FILE UPLOAD =====
// Click to select files
selectFilesBtn.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('click', (e) => {
    if (e.target === uploadArea || e.target.closest('.upload-icon, .upload-text, .upload-subtext')) {
        fileInput.click();
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert('Por favor selecciona solo archivos de imagen');
        return;
    }
    
    selectedFiles = [...selectedFiles, ...imageFiles];
    displayPreview();
}

function displayPreview() {
    if (selectedFiles.length === 0) {
        previewArea.style.display = 'none';
        return;
    }
    
    previewArea.style.display = 'block';
    previewGrid.innerHTML = '';
    fileCount.textContent = selectedFiles.length;
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="preview-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewGrid.appendChild(previewItem);
            
            // Remove file handler
            previewItem.querySelector('.preview-remove').addEventListener('click', () => {
                removeFile(index);
            });
        };
        reader.readAsDataURL(file);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    displayPreview();
}

function clearSelectedFiles() {
    selectedFiles = [];
    fileInput.value = '';
    displayPreview();
}

// Cancel upload
cancelBtn.addEventListener('click', clearSelectedFiles);

// Upload files
uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    
    try {
        uploadArea.style.display = 'none';
        previewArea.style.display = 'none';
        progressContainer.style.display = 'block';
        
        const totalFiles = selectedFiles.length;
        let uploadedFiles = 0;
        
        for (const file of selectedFiles) {
            // Compress image before uploading
            updateProgress(
                Math.round((uploadedFiles / totalFiles) * 100), 
                `Comprimiendo ${uploadedFiles + 1} de ${totalFiles} fotos...`
            );
            
            const compressedFile = await compressImage(file);
            
            updateProgress(
                Math.round((uploadedFiles / totalFiles) * 100), 
                `Subiendo ${uploadedFiles + 1} de ${totalFiles} fotos...`
            );
            
            await uploadFile(compressedFile, file.name);
            uploadedFiles++;
            
            const percent = Math.round((uploadedFiles / totalFiles) * 100);
            updateProgress(percent, `Completado ${uploadedFiles} de ${totalFiles} fotos`);
        }
        
        // Success
        alert(`¡${totalFiles} foto(s) subida(s) exitosamente!`);
        clearSelectedFiles();
        loadGallery();
        
        // Reset UI
        progressContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        updateProgress(0, 'Subiendo...');
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error al subir las fotos. Por favor intenta de nuevo.');
        progressContainer.style.display = 'none';
        uploadArea.style.display = 'block';
    }
});

// ===== IMAGE COMPRESSION =====
async function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create new file with compressed data
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            
                            console.log(`Compresión: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Error al comprimir imagen'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => reject(new Error('Error al cargar imagen'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
}

async function uploadFile(file, originalName) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${originalName}`;
    const storageRef = ref(storage, `${currentCategory}/${fileName}`);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress monitoring (optional)
            },
            (error) => {
                reject(error);
            },
            async () => {
                // Upload completed, get download URL
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Save metadata to Firestore
                await addDoc(collection(db, 'images'), {
                    category: currentCategory,
                    url: downloadURL,
                    fileName: fileName,
                    uploadedAt: new Date(),
                    uploadedBy: currentUser.email
                });
                
                resolve();
            }
        );
    });
}

function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressText.textContent = text;
}

// ===== GALLERY =====
async function loadGallery() {
    try {
        showLoading(true);
        gallery.innerHTML = '';
        
        // Query images from Firestore
        const q = query(
            collection(db, 'images'),
            where('category', '==', currentCategory)
        );
        
        const querySnapshot = await getDocs(q);
        const images = [];
        
        querySnapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by upload date (newest first)
        images.sort((a, b) => b.uploadedAt?.toMillis() - a.uploadedAt?.toMillis());
        
        if (images.length === 0) {
            emptyGallery.style.display = 'block';
            gallery.style.display = 'none';
            imageCountSpan.textContent = '0 imágenes';
        } else {
            emptyGallery.style.display = 'none';
            gallery.style.display = 'grid';
            imageCountSpan.textContent = `${images.length} imagen${images.length !== 1 ? 'es' : ''}`;
            
            images.forEach(image => {
                const galleryItem = createGalleryItem(image);
                gallery.appendChild(galleryItem);
            });
        }
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        alert('Error al cargar la galería');
    } finally {
        showLoading(false);
    }
}

function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${image.url}" alt="${image.fileName}" loading="lazy">
        <div class="gallery-overlay">
            <div class="gallery-actions">
                <button class="btn-delete" data-id="${image.id}" data-filename="${image.fileName}">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>
    `;
    
    // Delete handler
    item.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImage(image.id, image.fileName);
    });
    
    // Click to view full image
    item.addEventListener('click', () => {
        window.open(image.url, '_blank');
    });
    
    return item;
}

async function deleteImage(imageId, fileName) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Delete from Storage
        const storageRef = ref(storage, `${currentCategory}/${fileName}`);
        await deleteObject(storageRef);
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'images', imageId));
        
        // Reload gallery
        await loadGallery();
        
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error al eliminar la imagen');
    } finally {
        showLoading(false);
    }
}

// ===== UTILITY FUNCTIONS =====
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}
