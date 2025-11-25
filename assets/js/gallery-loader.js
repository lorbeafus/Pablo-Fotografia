// Gallery Loader - Loads images from Firestore for public pages
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Get category from page
function getCurrentCategory() {
    const path = window.location.pathname;
    if (path.includes('bodas')) return 'bodas';
    if (path.includes('15años') || path.includes('15anos')) return '15años';
    if (path.includes('vistas')) return 'vistas';
    if (path.includes('bookpro')) return 'books';
    return null;
}

// Load gallery images
async function loadGallery() {
    const category = getCurrentCategory();
    if (!category) return;

    const container = document.querySelector('.productos-contenedor');
    if (!container) return;

    try {
        // Query images from Firestore
        const q = query(
            collection(db, 'images'),
            where('category', '==', category)
        );

        const querySnapshot = await getDocs(q);
        const images = [];

        querySnapshot.forEach((doc) => {
            images.push(doc.data());
        });

        // Sort by upload date (newest first)
        images.sort((a, b) => b.uploadedAt?.toMillis() - a.uploadedAt?.toMillis());

        // Clear existing hardcoded images
        container.innerHTML = '';

        // Add images from Firestore
        if (images.length > 0) {
            images.forEach(image => {
                const productDiv = document.createElement('div');
                productDiv.className = 'producto';
                productDiv.innerHTML = `
                    <div class="img-box">
                        <img src="${image.url}" alt="${image.fileName}" loading="lazy">
                    </div>
                `;
                container.appendChild(productDiv);
            });
        } else {
            // Show message if no images
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; width: 100%; color: #666;">
                    <p>Aún no hay fotos en esta categoría.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading gallery:', error);
        // Keep hardcoded images if there's an error
    }
}

// Load gallery when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGallery);
} else {
    loadGallery();
}
