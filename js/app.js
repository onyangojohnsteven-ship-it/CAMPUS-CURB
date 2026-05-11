document.addEventListener('DOMContentLoaded', () => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.error('Service Worker registration failed', err));
        });
    }

    // 2. Data Store & State
    let cart = [];
    const products = [
        { id: 1, title: 'MacBook Pro M1 (13-inch)', price: 3500000, category: 'Laptops', condition: 'Mint', seller: 'J.A.', building: 'Chem Bldg', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80' },
        { id: 2, title: 'Arduino Engineering Kit v2', price: 180000, category: 'Engineering', condition: 'New', seller: 'M.S.', building: 'Eng Lab', img: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80' },
        { id: 3, title: 'Sony WH-1000XM4 Headphones', price: 950000, category: 'Accessories', condition: 'Refurbished', seller: 'R.K.', building: 'Library', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
        { id: 4, title: 'iPad Air 4 (256GB, Wi-Fi)', price: 1500000, category: 'Phones', condition: 'Mint', seller: 'S.L.', building: 'Student Ctr', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' },
        { id: 5, title: 'TP-Link Archer AX50 Router', price: 250000, category: 'Networking', condition: 'New', seller: 'G.H.', building: 'Tech Hub', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80' },
        { id: 6, title: 'Raspberry Pi 4 Model B', price: 320000, category: 'Engineering', condition: 'New', seller: 'K.P.', building: 'CS Dept', img: 'https://images.unsplash.com/photo-1629654291663-b91ad427698f?auto=format&fit=crop&w=600&q=80' },
        { id: 7, title: 'Logitech MX Master 3S', price: 420000, category: 'Accessories', condition: 'Mint', seller: 'H.V.', building: 'Library', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80' },
        { id: 8, title: 'Samsung T7 Shield 1TB SSD', price: 480000, category: 'Networking', condition: 'New', seller: 'F.B.', building: 'Dorm B', img: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80' },
        { id: 9, title: 'Dell UltraSharp 27" 4K Monitor', price: 1100000, category: 'Engineering', condition: 'Mint', seller: 'L.M.', building: 'Arch Studio', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
        { id: 10, title: 'Mechanical Keyboard (Blue)', price: 150000, category: 'Accessories', condition: 'New', seller: 'Z.Q.', building: 'Union', img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80' }
    ];

    // 3. Selectors
    const menuToggle = document.querySelector('.menu-toggle');
    const navOverlay = document.getElementById('mobileNav');
    const navClose = document.querySelector('.nav-close');
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const productGrid = document.getElementById('productGrid');
    const categoryCards = document.querySelectorAll('.category-card');
    const searchInput = document.getElementById('searchInput');
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');

    const productModalOverlay = document.getElementById('productModalOverlay');
    const productModalClose = document.getElementById('productModalClose');
    const productModalBody = document.getElementById('productModalBody');

    const themeToggle = document.getElementById('themeToggle');

    // 4. Formatting Utils
    function formatCurrency(amount) {
        return 'UGX ' + amount.toLocaleString();
    }

    // 5. Menu Logic
    function toggleMenu(show) {
        if (show) {
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', () => toggleMenu(true));
    if (navClose) navClose.addEventListener('click', () => toggleMenu(false));

    // 6. Cart Logic
    function toggleCart(show) {
        if (show) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
    if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    function addToCart(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            cart.push(product);
            updateCartUI();
            toggleCart(true);
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    function updateCartUI() {
        if (cartCount) cartCount.textContent = cart.length;
        if (cartBadge) cartBadge.textContent = cart.length;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Empty Cart</p>';
            cartTotal.textContent = 'UGX 0';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
                    <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.85rem; font-weight: 700;">${item.title}</h4>
                        <span style="color: var(--primary-blue); font-weight: 800; font-size: 0.9rem;">${formatCurrency(item.price)}</span>
                    </div>
                    <button onclick="window.removeFromCart(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer;">&times;</button>
                </div>
            `;
        }).join('');
        
        cartTotal.textContent = formatCurrency(total);
    }

    // 7. Product Modal Logic
    function openProductModal(id) {
        const p = products.find(prod => prod.id === id);
        if (!p) return;

        productModalBody.innerHTML = `
            <div style="padding: 2.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div>
                    <img src="${p.img}" alt="${p.title}" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-light);">
                </div>
                <div>
                    <span style="display: inline-block; padding: 0.2rem 0.6rem; background: #eff6ff; color: var(--primary-blue); border: 1px solid #bfdbfe; border-radius: 4px; font-size: 0.7rem; font-weight: 700; margin-bottom: 1rem;">${p.category}</span>
                    <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem;">${p.title}</h2>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.5rem;">${formatCurrency(p.price)}</div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 0.8rem; background: var(--bg-ghost); padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-main);">Condition: ${p.condition}</div>
                        <div style="font-size: 0.8rem; background: var(--bg-ghost); padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-main);">Seller: ${p.seller}</div>
                        <div style="font-size: 0.8rem; background: var(--bg-ghost); padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-main);">Location: ${p.building}</div>
                    </div>
                    
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem;">This ${p.title} is available for local trade within the university campus. Contact the seller to arrange a safe meeting at ${p.building}.</p>
                    
                    <button class="btn btn-primary" onclick="window.addToCart(${p.id}); window.closeProductModal();" style="width: 100%; justify-content: center;">Add to Cart</button>
                </div>
            </div>
        `;

        productModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        productModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (productModalClose) productModalClose.addEventListener('click', closeProductModal);
    if (productModalOverlay) productModalOverlay.addEventListener('click', (e) => {
        if (e.target === productModalOverlay) closeProductModal();
    });

    // Expose functions to global
    window.removeFromCart = removeFromCart;
    window.addToCart = addToCart;
    window.openProductModal = openProductModal;
    window.closeProductModal = closeProductModal;

    // 8. View Switching Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = link.getAttribute('data-view');
            
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll(`[data-view="${targetViewId}"]`).forEach(l => l.classList.add('active'));

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetViewId}-view`) view.classList.add('active');
            });

            toggleMenu(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 9. Product Rendering
    function renderProducts(filter = 'all', query = '') {
        if (!productGrid) return;

        const filtered = products.filter(p => {
            const matchesCategory = filter === 'all' || p.category.toLowerCase().includes(filter.toLowerCase().split('/')[0]);
            const matchesSearch = p.title.toLowerCase().includes(query.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 5rem; color: var(--text-muted);"><h3>No items found matching your search.</h3></div>';
            return;
        }

        productGrid.innerHTML = filtered.map(p => `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                    <span class="condition-badge">${p.condition}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">${formatCurrency(p.price)}</div>
                    <div class="product-seller">
                        <div class="seller-avatar">${p.seller.charAt(0)}</div>
                        <span>${p.seller} &bull; ${p.building}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-detail" onclick="window.openProductModal(${p.id})">Details</button>
                        <button class="btn-contact" onclick="window.addToCart(${p.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 10. Filters & Search
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            renderProducts(card.dataset.category, searchInput.value);
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.category-card.active')?.dataset.category || 'all';
            renderProducts(activeCategory, e.target.value);
        });
    }

    // 11. Initial Load
    renderProducts();
    updateCartUI();
});
