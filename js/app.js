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
        { id: 1, title: 'MacBook Pro M1 (13-inch)', price: 800, category: 'Laptops', condition: 'Mint', seller: 'J.A.', building: 'Chem Bldg', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80' },
        { id: 2, title: 'Arduino Engineering Kit v2', price: 45, category: 'Engineering', condition: 'New', seller: 'M.S.', building: 'Eng Lab', img: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80' },
        { id: 3, title: 'Sony WH-1000XM4 Headphones', price: 120, category: 'Accessories', condition: 'Refurbished', seller: 'R.K.', building: 'Library', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
        { id: 4, title: 'iPad Air 4 (256GB, Wi-Fi)', price: 350, category: 'Phones', condition: 'Mint', seller: 'S.L.', building: 'Student Ctr', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' },
        { id: 5, title: 'TP-Link Archer AX50 Router', price: 65, category: 'Networking', condition: 'New', seller: 'G.H.', building: 'Tech Hub', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80' },
        { id: 6, title: 'Raspberry Pi 4 Model B', price: 55, category: 'Engineering', condition: 'New', seller: 'K.P.', building: 'CS Dept', img: 'https://images.unsplash.com/photo-1629654291663-b91ad427698f?auto=format&fit=crop&w=600&q=80' },
        { id: 7, title: 'Logitech MX Master 3S', price: 80, category: 'Accessories', condition: 'Mint', seller: 'H.V.', building: 'Library', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80' },
        { id: 8, title: 'Samsung T7 Shield 1TB SSD', price: 95, category: 'Networking', condition: 'New', seller: 'F.B.', building: 'Dorm B', img: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80' },
        { id: 9, title: 'Dell UltraSharp 27" 4K Monitor', price: 280, category: 'Engineering', condition: 'Mint', seller: 'L.M.', building: 'Arch Studio', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
        { id: 10, title: 'Mechanical Keyboard (Blue Switches)', price: 40, category: 'Accessories', condition: 'New', seller: 'Z.Q.', building: 'Union', img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80' }
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
    const themeIcon = themeToggle.querySelector('i');

    // 4. Theme Logic
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

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

    // 5. Cart Logic
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
            
            // Notification or visual feedback
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            setTimeout(() => btn.innerHTML = originalText, 2000);
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
            cartItemsContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim); margin-top: 5rem;"><i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.2;"></i><p>Your cart is empty.</p></div>';
            cartTotal.textContent = '$0.00';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 20px; border: 1px solid var(--glass-border);">
                    <img src="${item.img}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 14px;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem; font-weight: 700;">${item.title}</h4>
                        <span style="color: var(--primary-magenta); font-weight: 800; font-size: 1.1rem;">$${item.price}</span>
                    </div>
                    <button onclick="window.removeFromCart(${index})" class="icon-btn" style="color: #ef4444;">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // 6. Product Modal Logic
    function openProductModal(id) {
        const p = products.find(prod => prod.id === id);
        if (!p) return;

        productModalBody.innerHTML = `
            <div class="modal-body-content" style="padding: 3rem;">
                <div class="modal-image-container">
                    <img src="${p.img}" alt="${p.title}" style="width: 100%; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                </div>
                <div class="modal-details">
                    <span class="hero-badge" style="margin-bottom: 1rem;">${p.category}</span>
                    <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">${p.title}</h2>
                    <div class="modal-price" style="font-size: 2rem; font-weight: 800; color: var(--primary-magenta); margin-bottom: 2rem;">$${p.price}</div>
                    
                    <div class="modal-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
                        <div class="meta-pill" style="background: var(--bg-card); border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-microchip" style="color: var(--primary-violet);"></i> Condition: ${p.condition}</div>
                        <div class="meta-pill" style="background: var(--bg-card); border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-user-circle" style="color: var(--primary-indigo);"></i> Seller: ${p.seller}</div>
                        <div class="meta-pill" style="background: var(--bg-card); border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-location-dot" style="color: var(--primary-magenta);"></i> ${p.building}</div>
                    </div>
                    
                    <div style="color: var(--text-dim); margin-bottom: 3rem; line-height: 1.8;">
                        <p>Experience the peak of student-to-student commerce. This ${p.title} has been verified for quality and is ready for immediate handover at ${p.building}. Secure it now to level up your campus workflow.</p>
                    </div>
                    
                    <button class="btn btn-primary btn-full" onclick="window.addToCart(${p.id}); window.closeProductModal();" style="justify-content: center;">
                        <i class="fas fa-cart-plus"></i> Acquire Item
                    </button>
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

    // 7. View Switching Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = link.getAttribute('data-view');
            
            navLinks.forEach(l => l.classList.remove('active'));
            // Support multiple links to same view
            document.querySelectorAll(`[data-view="${targetViewId}"]`).forEach(l => l.classList.add('active'));

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetViewId}-view`) view.classList.add('active');
            });

            toggleMenu(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // 8. Product Rendering
    function renderProducts(filter = 'all', query = '') {
        if (!productGrid) return;

        const filtered = products.filter(p => {
            const matchesCategory = filter === 'all' || p.category.toLowerCase().includes(filter.toLowerCase().split('/')[0]);
            const matchesSearch = p.title.toLowerCase().includes(query.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 5rem; color: var(--text-dim);"><h3>No premium gear found matching your search.</h3></div>';
            return;
        }

        productGrid.innerHTML = filtered.map(p => `
            <div class="product-card" style="opacity: 0; transform: translateY(30px); transition: all 0.6s ease-out;">
                <div class="product-image-wrapper">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                    <span class="condition-badge">${p.condition}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">$${p.price}</div>
                    <div class="product-seller">
                        <div class="seller-avatar">${p.seller.charAt(0)}</div>
                        <span>${p.seller} &bull; ${p.building}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-detail" onclick="window.openProductModal(${p.id})">Details</button>
                        <button class="btn-contact" onclick="window.addToCart(${p.id})"><i class="fas fa-plus"></i> Cart</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Trigger animations
        setTimeout(() => {
            const cards = productGrid.querySelectorAll('.product-card');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }, 50);
    }

    // 9. Filters & Search
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

    // 10. Initial Load
    renderProducts();
    updateCartUI();
});
