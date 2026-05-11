document.addEventListener('DOMContentLoaded', () => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
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
        { id: 10, title: 'Mechanical Keyboard (Blue Switches)', price: 40, category: 'Accessories', condition: 'New', seller: 'Z.Q.', building: 'Union', img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80' },
        { id: 11, title: 'Graphing Calculator TI-84 Plus', price: 70, category: 'Engineering', condition: 'Refurbished', seller: 'B.R.', building: 'Science Bldg', img: 'https://images.unsplash.com/photo-1543639828-09559f131551?auto=format&fit=crop&w=600&q=80' },
        { id: 13, title: 'USB-C Hub (7-in-1)', price: 35, category: 'Accessories', condition: 'New', seller: 'N.X.', building: 'Union', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80' },
        { id: 14, title: 'Webcam 1080p HD', price: 50, category: 'Accessories', condition: 'Mint', seller: 'P.O.', building: 'Tech Hub', img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80' },
        { id: 15, title: 'External Hard Drive 2TB', price: 60, category: 'Networking', condition: 'New', seller: 'W.S.', building: 'Dorm C', img: 'https://images.unsplash.com/photo-1531492746377-ad60cb3e2863?auto=format&fit=crop&w=600&q=80' },
        { id: 16, title: 'Bose QuietComfort 35 II', price: 150, category: 'Accessories', condition: 'Refurbished', seller: 'Q.T.', building: 'Library', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80' }
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
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
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

    menuToggle.addEventListener('click', () => toggleMenu(true));
    navClose.addEventListener('click', () => toggleMenu(false));

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

    cartBtn.addEventListener('click', () => toggleCart(true));
    cartClose.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

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
        cartCount.textContent = cart.length;
        cartBadge.textContent = cart.length;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Your cart is empty.</p>';
            cartTotal.textContent = '$0.00';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 16px; border: 1px solid var(--border-color);">
                    <img src="${item.img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem; font-weight: 700;">${item.title}</h4>
                        <span style="color: var(--primary-orange); font-weight: 800;">$${item.price}</span>
                    </div>
                    <button onclick="window.removeFromCart(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem; font-size: 1.1rem;">
                        <i class="fas fa-trash"></i>
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
            <div class="modal-body-content">
                <div class="modal-image-container">
                    <img src="${p.img}" alt="${p.title}">
                </div>
                <div class="modal-details">
                    <span class="category-pill" style="display: inline-block; padding: 0.35rem 1rem; background: var(--bg-light); border-radius: 99px; font-size: 0.8rem; font-weight: 700; color: var(--primary-blue); margin-bottom: 1rem;">${p.category}</span>
                    <h2>${p.title}</h2>
                    <div class="modal-price">$${p.price}</div>
                    
                    <div class="modal-meta">
                        <div class="meta-pill"><i class="fas fa-check-circle"></i> Condition: ${p.condition}</div>
                        <div class="meta-pill"><i class="fas fa-user"></i> Seller: ${p.seller}</div>
                        <div class="meta-pill"><i class="fas fa-map-marker-alt"></i> Location: ${p.building}</div>
                    </div>
                    
                    <div class="modal-description">
                        <p>This ${p.title} is in ${p.condition.toLowerCase()} condition. Available for local pickup at ${p.building}. Contact the seller for more details or add to cart to proceed.</p>
                    </div>
                    
                    <div class="modal-actions" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                        <button class="btn btn-primary" onclick="window.addToCart(${p.id}); window.closeProductModal();" style="justify-content: center; width: 100%;">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
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

    productModalClose.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', (e) => {
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
            link.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${targetViewId}-view`) view.classList.add('active');
            });

            toggleMenu(false);
            window.scrollTo(0, 0);
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

        productGrid.innerHTML = filtered.map(p => `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${p.img}" alt="${p.title}">
                    <span class="condition-badge">${p.condition}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">$${p.price}</div>
                    <div class="product-seller">
                        <div class="seller-avatar">${p.seller.charAt(0)}</div>
                        <span>${p.seller} - ${p.building}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-detail" onclick="window.openProductModal(${p.id})">View Details</button>
                        <button class="btn-contact" onclick="window.addToCart(${p.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');
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
            const activeCategory = document.querySelector('.category-card.active').dataset.category;
            renderProducts(activeCategory, e.target.value);
        });
    }

    // 10. Initial Load
    renderProducts();
    updateCartUI();
});
