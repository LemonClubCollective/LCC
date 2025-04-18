// public/scripts.js
let loggedInUsername = null;
let loggedInProfilePic = null;
let isAdmin = false;
let solPrice = null;
let lemonadePoints = bigInt(0);
let stakingPoints = bigInt(0);
let arcadePoints = bigInt(0);
let questPoints = bigInt(0);
let mintingPoints = bigInt(0);
let bonusPoints = bigInt(0);
let loginStreak = 0; 
let walletAddress = null;
let lastLogin = null;
 const profilePics = [
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP2.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP3.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP5.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP6.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP7.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP8.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP9.png',
            'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP10.png'
        ];




if (!window.Buffer) {
    window.Buffer = function Buffer(arg) {
        if (typeof arg === 'string') {
            return new Uint8Array([...arg].map(char => char.charCodeAt(0)));
        } else if (arg instanceof Uint8Array) {
            return arg;
        }
        throw new Error('Buffer constructor not fully implemented');
    };
    window.Buffer.from = function from(str, encoding) {
        if (encoding === 'base64') {
            const binaryString = atob(str);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } else if (encoding === 'utf8' || !encoding) {
            return new Uint8Array([...str].map(char => char.charCodeAt(0)));
        }
        throw new Error('Encoding not supported');
    };
    console.log('Inline Buffer polyfill loaded');
}




// Debug templating issues
window.addEventListener('error', (event) => {
    if (event && event.message && typeof event.message === 'string' && event.message.includes('404')) {
        console.error('404 Error on URL:', event.filename, 'Line:', event.lineno, 'Message:', event.message);
    } else {
        console.error('Error event:', event);
    }
}, true);




console.log('[Script] Checking for mintNFT overrides...');
if (typeof window.mintNFT !== 'undefined') console.log('[Script] WARNING: mintNFT already defined!');
console.log('Debug script executed before Solana Web3 load');




        const port = 8080;         
        const gameTimers = {};
        let startTime = null;
        let profilePicHistory = [];
        let lastScrollTop = 0;
        const gamePlaytimes = { 'big-dill': 0, 'owl-capone': 0, 'lenny-lemon': 0 };
        let postsToday = 0;
        let socialVisitsToday = 0;
        let arcadePlayToday = 0;
        let sectionsVisitedToday = new Set();
            
	const stripeClient = Stripe(window.STRIPE_PUBLISHABLE_KEY);        
     
        document.addEventListener('DOMContentLoaded', () => {
            // Debug roadmap image load
            const roadmapImg = document.querySelector('.roadmap-img');
            if (roadmapImg) {
                roadmapImg.onerror = () => {
                    console.error('Roadmap image failed to load:', roadmapImg.src);
                    roadmapImg.src = 'https://via.placeholder.com/500?text=Roadmap+Image+Not+Found';
                };
                roadmapImg.onload = () => console.log('Roadmap image loaded successfully:', roadmapImg.src);
            }




            // Set up scroll event for header
            window.addEventListener('scroll', function() {
                const header = document.querySelector('.header');
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > lastScrollTop) header.classList.add('header-hidden');
                else header.classList.remove('header-hidden');
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            });




            // Initialize UI elements
            document.getElementById('splash-page').style.display = 'block';
            document.getElementById('main-site').style.display = 'none';
            if (window.solana && window.solana.isConnected) toggleWalletConnection();
            updateAuthButton();
            updateProfileIcon();
            updateQuestsDisplay();
            updatePointsDisplay();




            // Set up registration button logic
            const regTos = document.getElementById('regTos');
            const regRisk = document.getElementById('regRisk');
            if (regTos) regTos.addEventListener('change', updateRegisterButton);
            if (regRisk) regRisk.addEventListener('change', updateRegisterButton);
});




function initBigIntegerVars() {
            if (typeof BigInteger === 'undefined') {
                console.error('BigInteger not available—check local install');
                return;
            }
            lemonadePoints = BigInteger(0);
            stakingPoints = BigInteger(0);
            arcadePoints = BigInteger(0);
            questPoints = BigInteger(0);
            mintingPoints = BigInteger(0);
            bonusPoints = BigInteger(0);
            console.log('BigInteger variables initialized');
        }




        if (typeof BigInteger !== 'undefined') {
            initBigIntegerVars();
        } else {
            console.error('BigInteger not loaded yet—waiting...');
        }




function stopAllGameTimers() {
    // Access gameTimers from the global scope (defined in index.html)
    for (const timerId in window.gameTimers) {
        clearInterval(window.gameTimers[timerId]);
        delete window.gameTimers[timerId];
    }
    console.log('All game timers stopped');
 }




function updateAuthButton() {
            document.getElementById('auth-btn').textContent = loggedInUsername ? 'Logout' : 'Login';
        }


function updateProfileIcon() {
    const profileIcon = document.getElementById('profile-icon');
    if (!profileIcon) {
        console.error('[ProfileIcon] Element not found');
        return;
    }


    const defaultProfilePic = 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
    let profilePicUrl = loggedInProfilePic || defaultProfilePic;


    if (profilePicUrl !== defaultProfilePic) {
        const filename = profilePicUrl.split('/').pop();
        profilePicUrl = `https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/${filename}`;
    }


    const img = new Image();
    img.onerror = () => {
        console.warn('[ProfileIcon] Failed to load profile image, using default:', profilePicUrl);
        profileIcon.src = defaultProfilePic;
    };
    img.onload = () => {
        profileIcon.src = profilePicUrl;
        console.log('[ProfileIcon] Successfully loaded:', profilePicUrl);
    };
    img.src = profilePicUrl;
}




document.addEventListener('DOMContentLoaded', () => {
    // Existing code...
    checkSession(); // Add this to check session on load

    // Set up scroll event for header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) header.classList.add('header-hidden');
        else header.classList.remove('header-hidden');
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Initialize UI elements
    document.getElementById('splash-page').style.display = 'block';
    document.getElementById('main-site').style.display = 'none';
    if (window.solana && window.solana.isConnected) toggleWalletConnection();
    updateAuthButton();
    updateProfileIcon();
    updateQuestsDisplay();
    updatePointsDisplay();

    // Set up registration button logic
    const regTos = document.getElementById('regTos');
    const regRisk = document.getElementById('regRisk');
    if (regTos) regTos.addEventListener('change', updateRegisterButton);
    if (regRisk) regRisk.addEventListener('change', updateRegisterButton);
});

// New function to check session
async function checkSession() {
    try {
        const response = await fetch('/check-session', {
            method: 'GET',
            credentials: 'include'
        });
        const result = await response.json();
        console.log('[CheckSession] Response:', result);
        if (response.ok && result.success) {
            loggedInUsername = result.username.toLowerCase();
            loggedInProfilePic = result.profilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
            isAdmin = result.isAdmin || false;
            lemonadePoints = bigInt(result.lemonadePoints || "0");
            stakingPoints = bigInt(result.stakingPoints || "0");
            arcadePoints = bigInt(result.arcadePoints || "0");
            questPoints = bigInt(result.questPoints || "0");
            mintingPoints = bigInt(result.mintingPoints || "0");
            bonusPoints = bigInt(result.bonusPoints || "0");
            updateAuthButton();
            updateProfileIcon();
            updatePointsDisplay();
            document.getElementById('login-status').textContent = `Logged in as ${result.username}`;
            showContent('profile'); // Redirect to profile on session restore
        }
    } catch (error) {
        console.error('[CheckSession] Error:', error.message);
    }
}

async function fetchSolPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
            method: 'GET'
        });
        const data = await response.json();
        solPrice = data.solana.usd;
        console.log('[SolPrice] Fetched SOL price:', solPrice, 'USD');
        return solPrice;
    } catch (error) {
        console.error('[SolPrice] Error fetching SOL price:', error.message);
        return null;
    }
}

async function fetchShippingMethods(productId, variantId, address) {
    try {
        console.log('[ShippingMethods] Fetching with productId:', productId, 'variantId:', variantId, 'address:', address);
        const response = await fetch('/printify-shipping-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variantId, address }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log('[ShippingMethods] Fetched:', JSON.stringify(result, null, 2));
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch shipping methods');
        }
        if (!result.shippingMethods || result.shippingMethods.length === 0) {
            console.warn('[ShippingMethods] No shipping methods returned');
        }
        return result.shippingMethods;
    } catch (error) {
        console.error('[ShippingMethods] Error:', error.message);
        return [];
    }
}

async function populateShippingDropdown() {
    const shippingSelect = document.getElementById('shipping-method');
    if (!shippingSelect) {
        console.error('[PopulateShippingDropdown] Shipping method select not found');
        return;
    }
    shippingSelect.innerHTML = '<option value="">Select Shipping</option>';

    const productId = window.currentProductId;
    const variantId = window.currentVariantId;
    const addressFields = {
        firstName: document.getElementById('checkout-first-name').value.trim(),
        lastName: document.getElementById('checkout-last-name').value.trim(),
        street: document.getElementById('checkout-street').value.trim(),
        city: document.getElementById('checkout-city').value.trim(),
        state: document.getElementById('checkout-state').value.trim(),
        zip: document.getElementById('checkout-zip').value.trim(),
        country: document.getElementById('checkout-country').value.trim()
    };

    const address = `${addressFields.firstName} ${addressFields.lastName}, ${addressFields.street}, ${addressFields.city}, ${addressFields.state}, ${addressFields.zip}, ${addressFields.country}`;

    if (!productId || !variantId || !addressFields.country || !addressFields.zip) {
        console.warn('[PopulateShippingDropdown] Missing productId, variantId, or required address fields:', { productId, variantId, address });
        return;
    }

    const methods = await fetchShippingMethods(productId, variantId, address);
    console.log('[PopulateShippingDropdown] Populating with methods:', methods);
    window.shippingMethods = methods;
    methods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.id;
        option.textContent = `${method.name} - $${(method.cost / 100).toFixed(2)}`;
        option.dataset.cost = method.cost; // In cents
        shippingSelect.appendChild(option);
    });
    updateCheckoutTotal();
}

function startCheckout() {
    closeProductModal();
    const modal = document.getElementById('checkout-modal');
    if (!modal) {
        console.error('[CheckoutModal] Modal element not found');
        return;
    }

    const product = window.printifyProducts.find(p => p.id === window.currentProductId);
    if (!product) {
        console.error('[StartCheckout] Product not found:', window.currentProductId);
        return;
    }

    const selectedOptions = product.options.map(opt => {
        const select = document.getElementById(`option-${opt.name.replace(/\s+/g, '-')}`);
        return parseInt(select.value);
    });

    console.log('[StartCheckout] Selected options:', selectedOptions);

    let variant = product.variants.find(v => 
        v.options.every((optId, i) => optId === selectedOptions[i])
    );

    if (!variant) {
        console.warn('[StartCheckout] No matching variant found for options:', selectedOptions);
        variant = product.variants[0];
        console.log('[StartCheckout] Falling back to first variant:', variant);
    }

    window.currentVariantId = variant.id;
    window.currentPrice = variant.price / 100;
    document.getElementById('checkout-total').textContent = `$${window.currentPrice.toFixed(2)}`;
    updatePaymentFields();
    modal.classList.add('active');

    // Add event listeners to address fields to update shipping rates
    const addressFields = ['first-name', 'last-name', 'street', 'city', 'state', 'zip', 'country'];
    addressFields.forEach(field => {
        const input = document.getElementById(`checkout-${field}`);
        if (input) {
            input.addEventListener('change', () => {
                console.log('[AddressChange] Address field changed:', field);
                populateShippingDropdown();
            });
        }
    });

    // Initial population (will skip if address incomplete)
    populateShippingDropdown();
}

function updateCheckoutTotal() {
    const shippingSelect = document.getElementById('shipping-method');
    const totalSpan = document.getElementById('checkout-total');
    if (!shippingSelect || !totalSpan) {
        console.error('[UpdateCheckoutTotal] Elements not found');
        return;
    }
    const selectedOption = shippingSelect.options[shippingSelect.selectedIndex];
    const shippingCost = selectedOption && selectedOption.dataset.cost ? parseInt(selectedOption.dataset.cost) : 0;
    const productPrice = window.currentPrice ? window.currentPrice * 100 : 0; // Convert to cents
    const totalCost = (productPrice + shippingCost) / 100; // Convert back to dollars
    totalSpan.textContent = `$${totalCost.toFixed(2)}`;
    window.totalPrice = totalCost; // Store total for payment
}

// Update login function to handle form submission
async function login(event) {
    event.preventDefault(); // Prevent default form submission
    console.log('[Login] Login triggered');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    console.log('[Login] Username:', username, 'Password:', password);
    if (!username || !password) {
        alert('Please enter username and password!');
        return;
    }
    try {
        const response = await fetch('/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log('[Login] Response:', response.status, result);
        if (response.ok && result.success) {
            loggedInUsername = username.toLowerCase();
            loggedInProfilePic = result.profilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
            isAdmin = result.isAdmin || false;
            lemonadePoints = bigInt(result.lemonadePoints || "0");
            stakingPoints = bigInt(result.stakingPoints || "0");
            arcadePoints = bigInt(result.arcadePoints || "0");
            questPoints = bigInt(result.questPoints || "0");
            mintingPoints = bigInt(result.mintingPoints || "0");
            bonusPoints = bigInt(result.bonusPoints || "0");
            updateAuthButton();
            updateProfileIcon();
            updatePointsDisplay();
            document.getElementById('login-status').textContent = `Logged in as ${username}`;
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            showContent('profile');
            await updateProfileDisplay();
            alert('Login successful!');
            trackLoginStreak();
            await updateQuestProgressClient('section-adventurer', 'daily', 1);
        } else {
            alert(result.error || 'Login failed');
        }
    } catch (error) {
        console.error('[Login] Error:', error);
        alert('Login failed: ' + error.message);
    }
}



function logout() {
    loggedInUsername = null;
    loggedInProfilePic = null;
    isAdmin = false;
    lemonadePoints = bigInt(0);
    stakingPoints = bigInt(0);
    arcadePoints = bigInt(0);
    questPoints = bigInt(0);
    mintingPoints = bigInt(0);
    bonusPoints = bigInt(0);
    disconnectWallet();
    updateAuthButton();
    updateProfileIcon();
    updatePointsDisplay();
    document.getElementById('login-status').textContent = 'Not logged in';
    showContent('home');
    alert('Logged out successfully!');
         }




async function register() {
    console.log('[Register] Register button clicked');
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const emailConsent = document.getElementById('regEmailConsent').checked;
    console.log('[Register] Email:', email, 'Username:', username, 'Password:', password, 'Email Consent:', emailConsent);
    if (!email || !username || !password) {
        alert('Please enter email, username, and password!');
        return;
    }
    try {
        const response = await fetch(`/register`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, emailConsent }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            alert('Registration successful! Please check your email to verify your account.');
            showContent('home');
        } else {
            alert(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('[Register] Error:', error);
        alert('Registration failed: ' + error.message);
    }
}




function updateRegisterButton() {
    const tosChecked = document.getElementById('regTos')?.checked || false;
    const riskChecked = document.getElementById('regRisk')?.checked || false;
    const registerBtn = document.getElementById('join-btn'); // Changed from registerBtn
    if (registerBtn) {
        registerBtn.disabled = !(tosChecked && riskChecked);
    } else {
        console.warn('[UpdateRegisterButton] #join-btn not found');
    }
}




document.addEventListener('DOMContentLoaded', () => {
    const regTos = document.getElementById('regTos');
    const regRisk = document.getElementById('regRisk');
    const registerBtn = document.getElementById('join-btn');
    if (regTos && regRisk && registerBtn) {
        regTos.addEventListener('change', updateRegisterButton);
        regRisk.addEventListener('change', updateRegisterButton);
        updateRegisterButton();
    } else {
        console.warn('[DOMContentLoaded] Registration elements missing');
    }
});




function disconnectWallet() {
    if (window.solana && window.solana.isPhantom) {
        window.solana.disconnect();
        console.log('Wallet disconnected');
    }
    document.getElementById('wallet-status').textContent = 'Wallet not connected';
 }




async function loadProducts() {
    console.log('[loadProducts] Fetching Printify products...');
    try {
        const response = await fetch('/printify-products', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        console.log('[loadProducts] Response:', data);


        const productList = document.getElementById('store-products');
        if (!productList) {
            console.error('[loadProducts] Element #store-products not found in DOM');
            return;
        }


        if (response.ok && data.success && data.products && data.products.length > 0) {
            let html = '';
            data.products.forEach(product => {
                const safeTitle = product.title.replace(/"/g, '"');
                html += `<div class="product-card" onclick="showProductModal('${product.id}')"><img id="product-img-${product.id}" alt="${safeTitle}" style="max-width: 150px; border-radius: 10px;"><p>${safeTitle}</p><p>$${product.variants[0].price / 100}</p></div>`;
            });
            productList.innerHTML = html;


            data.products.forEach(product => {
                const img = document.getElementById(`product-img-${product.id}`);
                if (img && product.images && product.images[0] && product.images[0].src) {
                    img.src = product.images[0].src;
                    console.log('[loadProducts] Set image for', product.id, 'to', img.src);
                } else {
                    if (img) img.src = 'https://via.placeholder.com/150';
                    console.log('[loadProducts] No image for', product.id, 'using placeholder');
                }
            });
            window.printifyProducts = data.products; // Store products globally for modal
        } else {
            productList.innerHTML = `<p>${data.message || 'No products available yet'}</p>`;
            console.log('[loadProducts] No products:', data.message);
        }
    } catch (error) {
        console.error('[loadProducts] Error:', error.message);
        if (productList) productList.innerHTML = '<p>Error loading products—try again!</p>';
    }
}


function showProductModal(productId) {
    const product = window.printifyProducts.find(p => p.id === productId);
    if (!product) {
        console.error('[ProductModal] Product not found:', productId);
        return;
    }

    const modal = document.getElementById('product-modal');
    if (!modal) {
        console.error('[ProductModal] Modal element not found');
        return;
    }

    document.getElementById('product-modal-title').textContent = product.title;
    document.getElementById('product-modal-description').innerHTML = product.description;
    document.getElementById('product-modal-price').textContent = `$${product.variants[0].price / 100}`;

    // Collect valid option IDs from enabled variants only
    const validOptionIds = product.options.map(() => new Set());
    product.variants.forEach(variant => {
        if (variant.is_enabled) { // Only include enabled variants
            variant.options.forEach((optionId, index) => {
                validOptionIds[index].add(optionId);
            });
        }
    });
    console.log('[ProductModal] Valid option IDs for enabled variants:', validOptionIds);

    // Populate variant options
    let optionsHtml = '';
    const defaultVariant = product.variants.find(v => v.is_enabled) || product.variants[0];
    product.options.forEach((option, optIndex) => {
        const validIds = validOptionIds[optIndex];
        if (validIds.size > 0) {
            optionsHtml += `<label>${option.name}: <select id="option-${option.name.replace(/\s+/g, '-')}" onchange="updatePriceAndImages('${productId}')">`;
            const defaultOptionId = defaultVariant.options[optIndex];
            option.values.forEach(val => {
                if (validIds.has(val.id)) {
                    optionsHtml += `<option value="${val.id}" ${val.id === defaultOptionId ? 'selected' : ''}>${val.title}</option>`;
                }
            });
            optionsHtml += '</select></label><br>';
        }
    });
    document.getElementById('product-modal-options').innerHTML = optionsHtml || '<p>No variant options available</p>';

    // Initialize gallery with default variant images
    updateGalleryImages(productId, defaultVariant.id);

    window.currentProductId = productId;
    modal.classList.add('active');
}

function updatePriceAndImages(productId) {
    const product = window.printifyProducts.find(p => p.id === productId);
    if (!product) {
        console.error('[UpdatePriceAndImages] Product not found:', productId);
        return;
    }

    const selectedOptions = product.options.map(opt => {
        const select = document.getElementById(`option-${opt.name.replace(/\s+/g, '-')}`);
        return parseInt(select.value);
    });

    console.log('[UpdatePriceAndImages] Selected options:', selectedOptions);

    const variant = product.variants.find(v => {
        console.log('[UpdatePriceAndImages] Checking variant options:', v.options);
        return v.options.every((optId, i) => optId === selectedOptions[i]);
    });

    if (!variant) {
        console.error('[UpdatePriceAndImages] No matching variant found for options:', selectedOptions);
        return;
    }

    document.getElementById('product-modal-price').textContent = `$${variant.price / 100}`;
    window.currentPrice = variant.price / 100; // Store product price
    window.currentVariantId = variant.id; // Store variant ID
    updateGalleryImages(productId, variant.id);
}

// New helper function to update gallery images based on variant
function updateGalleryImages(productId, variantId) {
    const product = window.printifyProducts.find(p => p.id === productId);
    if (!product) {
        console.error('[UpdateGalleryImages] Product not found:', productId);
        return;
    }

    const gallery = document.getElementById('product-gallery-images');
    if (!gallery) {
        console.error('[UpdateGalleryImages] Gallery element not found');
        return;
    }

    // Filter images for the selected variant
    let variantImages = product.images.filter(img => 
        img.variant_ids && img.variant_ids.includes(variantId)
    );

    // Fallback to all images if no variant-specific images are found
    if (variantImages.length === 0) {
        console.warn('[UpdateGalleryImages] No variant-specific images found for variant:', variantId, 'using all product images');
        variantImages = product.images;
    }

    let galleryHtml = '';
    variantImages.forEach((img, index) => {
        galleryHtml += `<img src="${img.src || 'https://via.placeholder.com/300'}" alt="${product.title} - Image ${index + 1}">`;
    });

    gallery.innerHTML = galleryHtml || '<p>No images available for this variant</p>';
    console.log('[UpdateGalleryImages] Updated gallery for variant:', variantId, 'with', variantImages.length, 'images');
}


function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('active');
}

function scrollGallery(direction) {
    const gallery = document.getElementById('product-gallery-images');
    const scrollAmount = 310; // Width of one image (300px) + gap (10px)
    const currentScroll = gallery.scrollLeft;

    if (direction === 'prev') {
        gallery.scrollLeft = Math.max(0, currentScroll - scrollAmount);
    } else if (direction === 'next') {
        gallery.scrollLeft = currentScroll + scrollAmount;
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
}

async function startCheckout() {
    closeProductModal();
    const modal = document.getElementById('checkout-modal');
    if (!modal) {
        console.error('[CheckoutModal] Modal element not found');
        return;
    }

    const product = window.printifyProducts.find(p => p.id === window.currentProductId);
    if (!product) {
        console.error('[StartCheckout] Product not found:', window.currentProductId);
        return;
    }

    const selectedOptions = product.options.map(opt => {
        const select = document.getElementById(`option-${opt.name.replace(/\s+/g, '-')}`);
        return parseInt(select.value);
    });

    console.log('[StartCheckout] Selected options:', selectedOptions);

    let variant = product.variants.find(v => 
        v.options.every((optId, i) => optId === selectedOptions[i])
    );

    if (!variant) {
        console.warn('[StartCheckout] No matching variant found for options:', selectedOptions);
        variant = product.variants[0];
        console.log('[StartCheckout] Falling back to first variant:', variant);
    }

    window.currentVariantId = variant.id;
    window.currentPrice = variant.price / 100;
    document.getElementById('checkout-total').textContent = `$${window.currentPrice.toFixed(2)}`;

    // Pre-fill address fields with user data if available
    const userProfileResponse = await fetch(`/profile/${loggedInUsername}`, {
        method: 'GET',
        credentials: 'include'
    });
    const userProfile = await userProfileResponse.json();
    if (userProfile.success && userProfile.address) {
        const [firstName, lastName, street, city, state, zip, country] = userProfile.address.split(', ').map(s => s.trim());
        document.getElementById('checkout-first-name').value = firstName || '';
        document.getElementById('checkout-last-name').value = lastName || '';
        document.getElementById('checkout-street').value = street || '';
        document.getElementById('checkout-city').value = city || '';
        document.getElementById('checkout-state').value = state || '';
        document.getElementById('checkout-zip').value = zip || '';
        document.getElementById('checkout-country').value = country || '';
        document.getElementById('checkout-email').value = userProfile.email || '';
    }

    updatePaymentFields();
    modal.classList.add('active');

    const addressFields = ['first-name', 'last-name', 'street', 'city', 'state', 'zip', 'country'];
    addressFields.forEach(field => {
        const input = document.getElementById(`checkout-${field}`);
        if (input) {
            input.addEventListener('change', () => {
                console.log('[AddressChange] Address field changed:', field);
                populateShippingDropdown();
            });
        }
    });

    populateShippingDropdown();
}

function updatePaymentFields() {
    const method = document.getElementById('payment-method').value;
    const fieldsDiv = document.getElementById('payment-fields');
    console.log('[UpdatePaymentFields] Payment method:', method);
    fieldsDiv.innerHTML = '';
    if (method === 'stripe') {
        fieldsDiv.innerHTML = `<p>Proceed to Stripe checkout after clicking "Complete Purchase".</p>`;
    } else if (method === 'paypal') {
        fieldsDiv.innerHTML = `<p>Proceed to PayPal checkout after clicking "Complete Purchase".</p>`;
    } else if (method === 'coinbase') {
        fieldsDiv.innerHTML = `<p>Proceed to Coinbase checkout after clicking "Complete Purchase".</p>`;
    } else if (method === 'sol') {
        fieldsDiv.innerHTML = `<p>Pay with Solana wallet after clicking "Complete Purchase".</p>`;
    }
}

async function completePurchase() {
    if (!loggedInUsername) {
        alert('Please login to buy merch!');
        return;
    }

    const shipping = {
        firstName: document.getElementById('checkout-first-name').value.trim(),
        lastName: document.getElementById('checkout-last-name').value.trim(),
        email: document.getElementById('checkout-email').value.trim(),
        street: document.getElementById('checkout-street').value.trim(),
        city: document.getElementById('checkout-city').value.trim(),
        state: document.getElementById('checkout-state').value.trim(),
        zip: document.getElementById('checkout-zip').value.trim(),
        country: document.getElementById('checkout-country').value.trim()
    };

    if (Object.values(shipping).some(v => !v)) {
        alert('Please fill all shipping fields!');
        return;
    }

    const method = document.getElementById('payment-method').value;
    const shippingSelect = document.getElementById('shipping-method');
    const shippingMethodId = shippingSelect.value;
    if (!shippingMethodId) {
        alert('Please select a shipping method!');
        return;
    }

    const selectedOption = shippingSelect.options[shippingSelect.selectedIndex];
    const shippingCost = selectedOption && selectedOption.dataset.cost ? parseInt(selectedOption.dataset.cost) / 100 : 0;

    const address = `${shipping.firstName} ${shipping.lastName}, ${shipping.street}, ${shipping.city}, ${shipping.state}, ${shipping.zip}, ${shipping.country}`;

    try {
        let paymentResult;
        if (method === 'coinbase') {
            if (!walletAddress) {
                alert('Connect Solana wallet to pay with crypto!');
                return;
            }
            const chargeResponse = await fetch('/create-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: loggedInUsername, 
                    amount: window.totalPrice,
                    productId: window.currentProductId,
                    variantId: window.currentVariantId,
                    address: address,
                    shippingMethodId,
                    shippingCost
                }),
                credentials: 'include'
            });
            paymentResult = await chargeResponse.json();
            if (!chargeResponse.ok || !paymentResult.success) {
                throw new Error(paymentResult.error || 'Failed to create charge');
            }
            window.open(paymentResult.chargeUrl, '_blank');
            alert('Please complete the payment in the new window. Your order will be placed after confirmation.');
            document.getElementById('checkout-modal').classList.remove('active');
       } else if (method === 'stripe') {
    const stripeResponse = await fetch('/create-stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: loggedInUsername, 
            amount: window.totalPrice,
            productId: window.currentProductId,
            variantId: window.currentVariantId,
            address: address,
            shippingMethodId,
            shippingCost
        }),
        credentials: 'include'
    });
    paymentResult = await stripeResponse.json();
    if (!stripeResponse.ok || !paymentResult.success) {
        console.error('[StripeCheckout] Failed to create session:', paymentResult.error);
        throw new Error(paymentResult.error || 'Failed to create Stripe checkout');
    }
    const checkoutWindow = window.open(paymentResult.url, '_blank');
    if (!checkoutWindow) {
        console.error('[StripeCheckout] Failed to open checkout window (popup blocked?)');
        alert('Please allow popups and try again.');
        return;
    }
    document.getElementById('checkout-modal').classList.remove('active');
    // Display non-blocking notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #32cd32; color: white;
        padding: 10px 20px; border-radius: 5px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    notification.textContent = 'Complete the payment in the new window. You will be redirected after confirmation.';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
    // Poll payment status
    const checkStatus = setInterval(async () => {
        try {
           const response = await fetch(`/success?session_id=${paymentResult.sessionId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.text();
            if (response.ok && result.includes('Order placed successfully')) {
                clearInterval(checkStatus);
                console.log('[StripeCheckout] Payment successful, redirecting to /success');
                window.location.href = `/success?session_id=${paymentResult.sessionId}`;
                checkoutWindow.close();
            }
        } catch (error) {
            console.error('[StripeCheckout] Status check error:', error.message);
        }
    }, 2000);
} else if (method === 'paypal') {
    const paypalResponse = await fetch('/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: loggedInUsername, 
            amount: window.totalPrice,
            productId: window.currentProductId,
            variantId: window.currentVariantId,
            address: address,
            shippingMethodId,
            shippingCost
        }),
        credentials: 'include'
    });
    paymentResult = await paypalResponse.json();
    if (!paypalResponse.ok || !paymentResult.success) {
        console.error('[PayPalCheckout] Failed to create order:', paymentResult.error);
        throw new Error(paymentResult.error || 'Failed to create PayPal order');
    }
    const checkoutWindow = window.open(paymentResult.url, '_blank');
    if (!checkoutWindow) {
        console.error('[PayPalCheckout] Failed to open checkout window (popup blocked?)');
        alert('Please allow popups and try again.');
        return;
    }
    document.getElementById('checkout-modal').classList.remove('active');
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #32cd32; color: white;
        padding: 10px 20px; border-radius: 5px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    notification.textContent = 'Complete the payment in the new window...';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
    const baseUrl = 'https://www.lemonclubcollective.com';
    const startTime = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes
    let errorCount = 0;
    const maxErrors = 5;
    const checkStatus = setInterval(async () => {
        if (Date.now() - startTime > timeout || window.location.pathname === '/success' || checkoutWindow.closed) {
            clearInterval(checkStatus);
            console.log('[PayPalCheckout] Polling stopped:', 
                Date.now() - startTime > timeout ? 'Timeout' : 
                window.location.pathname === '/success' ? 'Redirected' : 'Window closed');
            if (!window.location.pathname.includes('/success')) {
                alert('Payment failed or was cancelled. Check your order status in your profile.');
            }
            return;
        }
        try {
            const response = await fetch(`${baseUrl}/paypal-success?orderID=${paymentResult.orderId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.success) {
                clearInterval(checkStatus);
                console.log('[PayPalCheckout] Payment successful, redirecting to /success');
                window.location.href = `${baseUrl}/success?orderID=${paymentResult.orderId}`;
                checkoutWindow.close();
            } else if (result.status === 'pending') {
                console.log('[PayPalCheckout] Order still pending, continuing to poll');
            } else {
                console.error('[PayPalCheckout] Polling error:', result.error);
                clearInterval(checkStatus);
                alert('Payment failed: ' + result.error + '. Check your order status in your profile.');
            }
        } catch (error) {
            console.error('[PayPalCheckout] Status check error:', error.message);
            errorCount++;
            if (errorCount >= maxErrors) {
                clearInterval(checkStatus);
                console.error('[PayPalCheckout] Too many polling errors, stopping');
                alert('Payment failed due to server error. Check your order status in your profile.');
            }
        }
    }, 2000);
        } else if (method === 'sol') {
            if (!walletAddress) {
                alert('Connect Solana wallet to pay with SOL!');
                return;
            }
            if (!window.solanaWeb3) {
                alert('Solana Web3 library not loaded. Please refresh and try again.');
                return;
            }
            console.log('[CompletePurchase] User wallet address:', walletAddress);
            if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
                console.error('[CompletePurchase] Invalid wallet address format:', walletAddress);
                throw new Error('Invalid wallet address format');
            }
            if (!solPrice) {
                solPrice = await fetchSolPrice();
                if (!solPrice) {
                    throw new Error('Failed to fetch SOL price');
                }
            }
            const amountSol = window.totalPrice / solPrice;
            console.log('[CompletePurchase] SOL amount:', amountSol, 'for $', window.totalPrice);
            alert(`You will pay ${amountSol.toFixed(4)} SOL for $${window.totalPrice.toFixed(2)}`);

            const solResponse = await fetch('/create-sol-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userWallet: walletAddress, 
                    amountSol: amountSol,
                    productId: window.currentProductId,
                    variantId: window.currentVariantId,
                    address: address,
                    shippingMethodId,
                    shippingCost
                }),
                credentials: 'include'
            });
            paymentResult = await solResponse.json();
            if (!solResponse.ok || !paymentResult.success) {
                throw new Error(paymentResult.error || 'Failed to create SOL transaction');
            }

            const transaction = window.solanaWeb3.Transaction.from(Buffer.from(paymentResult.transaction, 'base64'));
            const signature = await window.solana.signAndSendTransaction(transaction);
            const connection = new window.solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            await connection.confirmTransaction(signature);

            const orderResponse = await fetch('/printify-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: loggedInUsername, 
                    productId: window.currentProductId, 
                    variantId: window.currentVariantId,
                    address: address,
                    shippingMethodId,
                    shippingCost
                }),
                credentials: 'include'
            });
            const orderResult = await orderResponse.json();
            if (orderResult.success) {
                await fetch('/cleanup-pending-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: paymentResult.transaction }),
                    credentials: 'include'
                });

                alert('Order placed! ID: ' + orderResult.orderId);
                document.getElementById('checkout-modal').classList.remove('active');
            } else {
                throw new Error(orderResult.error || 'Failed to place order');
            }
        }
    } catch (error) {
        console.error('[CompletePurchase] Error:', error.message);
        alert('Failed to complete purchase: ' + error.message);
    }
}

async function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('orderID');
    if ((sessionId || orderId) && window.location.pathname === '/success') {
        try {
            const param = sessionId ? `session_id=${sessionId}` : `orderId=${orderId}`;
            const response = await fetch(`/success?${param}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.text();
            console.log('[CheckPaymentStatus] Response:', result);
            if (response.ok && result.includes('Order placed successfully')) {
                if (!sessionStorage.getItem('paymentConfirmed')) {
                    alert('Your order was placed successfully! Check your email for confirmation.');
                    sessionStorage.setItem('paymentConfirmed', 'true');
                }
            } else {
                console.error('[CheckPaymentStatus] Payment verification failed:', result);
                alert('Error verifying payment. Please check your order status in your profile.');
            }
        } catch (error) {
            console.error('[CheckPaymentStatus] Error:', error.message);
            alert('Error verifying payment: ' + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkPaymentStatus();
    // ... existing DOMContentLoaded code
});

async function updateNFTDisplay(containerId, showButtons = true) {
    console.log('[NFTDisplay] Starting update for container:', containerId);
    const container = document.getElementById(containerId);
    const guestPitch = document.getElementById('nft-guest-pitch');
    if (!container || !guestPitch) {
        console.error(`[NFTDisplay] Container ${containerId} or guest pitch not found`);
        return;
    }

    if (!loggedInUsername) {
        container.style.display = 'none';
        guestPitch.style.display = 'block';
        return;
    }

    const response = await fetch(`/nft/${loggedInUsername.toLowerCase()}`, { 
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    console.log('[NFTs] Received from server:', data);
    if (response.ok && data.success) {
        const nfts = data.nfts || [];
        if (nfts.length === 0) {
            container.style.display = 'none';
            guestPitch.style.display = 'block';
            return;
        }

        container.style.display = 'flex';
        guestPitch.style.display = 'none';

        let html = '';
        nfts.forEach((nft, index) => {
            const stageName = nft.name || 'Lemon Seed';
            const mintAddress = nft.mintAddress;
            const imageUri = nft.imageUri ? nft.imageUri.replace('3000', '3001') : `/output/nft_${Date.now()}.png`;
            const staked = nft.staked || false;
            console.log(`[NFT Display] NFT ${mintAddress} staked: ${staked}`);
            const baseStageName = stageName.split('#')[0].trim();
            const canEvolve = (typeof lemonadePoints.gte === 'function' ? lemonadePoints.gte(10) : Number(lemonadePoints) >= 10) && baseStageName !== 'Lemon Tree';
            html += `<div class="nft-card ${staked ? 'staked' : ''}" data-index="${index}">
                <img id="nft-img-${mintAddress}" alt="${stageName}" src="${imageUri}" 
                    onerror="this.onerror=null; this.src='https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/magicseed.png'; console.log('NFT image failed:', '${imageUri}')" 
                    style="max-width: 200px;">
                <p>${stageName}</p>
                <p>Mint Address: ${mintAddress.slice(0, 8)}...</p>`;
            if (staked && nft.stakeEnd) {
                html += `<p>Locked Until: ${new Date(nft.stakeEnd).toLocaleDateString()}</p>`;
            }
            html += `<div class="nft-card-buttons">`;
            if (showButtons) {
                if (staked) {
                    html += `<button class="nft-card-button unstake-btn" 
                        onclick="unstakeNFT('${mintAddress}'); event.stopPropagation();">Unstake</button>`;
                } else {
                    html += `
                        <select id="lock-period-${mintAddress}" onchange="updateStakeButton('${mintAddress}')">
                            <option value="1">1 Month</option>
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="9">9 Months</option>
                            <option value="12">12 Months</option>
                        </select>
                        <button class="nft-card-button stake-btn" 
                            onclick="stakeNFT('${mintAddress}'); event.stopPropagation();">Stake</button>`;
                }
                html += `<button class="nft-card-button evolve-btn" onclick="evolveNFT('${mintAddress}', this); event.stopPropagation();" 
                    ${canEvolve ? '' : 'disabled'}>Evolve</button>`;
            }
            html += `</div></div>`;
        });
        console.log('[NFT Display] Generated HTML:', html);
        container.innerHTML = html;

        const cards = container.querySelectorAll('.nft-card');
        console.log('[NFTDisplay] Found NFT cards:', cards.length);
        cards.forEach((card, idx) => {
            card.removeEventListener('click', card.clickHandler);
            card.clickHandler = (event) => {
                console.log('[NFTDisplay] Clicked NFT card at index:', idx);
                const index = card.getAttribute('data-index');
                console.log('[NFTDisplay] Index from attribute:', index);
                showNFTModal(index, nfts);
            };
            card.addEventListener('click', card.clickHandler);
        });
    } else {
        container.innerHTML = '<p>Error loading NFTs—try again!</p>';
    }
}


function showNFTModal(index, nfts) {
    console.log('[NFTModal] Showing modal for index:', index);
    const nft = nfts[index];
    if (!nft) {
        console.error('[NFTModal] NFT not found at index:', index);
        return;
    }
    const modal = document.getElementById('nft-modal');
    if (!modal) {
        console.error('[NFTModal] Modal element not found');
        return;
    }
    document.getElementById('nft-modal-title').textContent = nft.name;
    document.getElementById('nft-modal-image').src = nft.imageUri;
    document.getElementById('nft-modal-unique-holders').textContent = nft.uniqueHolders || '1';
    document.getElementById('nft-modal-network').textContent = nft.network || 'Solana Devnet';
    document.getElementById('nft-modal-name').textContent = nft.name;
    document.getElementById('nft-modal-mint-address').textContent = nft.mintAddress;
    document.getElementById('nft-modal-staked').textContent = nft.staked ? 'Yes' : 'No';
    document.getElementById('nft-modal-stake-start').textContent = nft.stakeStart ? new Date(nft.stakeStart).toLocaleString() : 'N/A';
    document.getElementById('nft-modal-stage').textContent = nft.stage || 'Sapling';
    document.getElementById('nft-modal-rarity').textContent = nft.rarity || 'Ruby';
    document.getElementById('nft-modal-background').textContent = nft.background || 'BGForestSunset';
    document.getElementById('nft-modal-base').textContent = nft.base || 'redrubysapling3';
    window.currentNFT = nft;
    modal.classList.add('active');
    console.log('[NFTModal] Modal class set to active, current style:', modal.style.display);
    console.log('[NFTModal] Modal computed style:', window.getComputedStyle(modal).display);
    console.log('[NFTModal] Modal visibility:', window.getComputedStyle(modal).visibility);
    console.log('[NFTModal] Modal z-index:', window.getComputedStyle(modal).zIndex);
    console.log('[NFTModal] Modal outerHTML:', modal.outerHTML);
}


function closeNFTModal() {
    const modal = document.getElementById('nft-modal');
    if (modal) {
        modal.classList.remove('active');
        console.log('[NFTModal] Modal closed');
    }
}


function shareNFTOnX() {
    if (!window.currentNFT) return console.error('[ShareNFT] No NFT data available');
    const nft = window.currentNFT;
    const tweetText = `I just minted ${nft.name} on Lemon Club Collective! 🍋 Check it out at https://www.lemonclubcollective.com #NFT #LemonClubCollective`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'width=600,height=400');
}




async function updatePostsDisplay() {
    const response = await fetch('/posts', {
        method: 'GET',
        credentials: 'include'
    });
    const postsData = await response.json();
    console.log('[Posts] Server response:', postsData);
    if (response.ok && Array.isArray(postsData) && postsData.length > 0) {
        let html = '';
        const sortedPosts = postsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedPosts.forEach((post) => {
            const date = new Date(post.timestamp).toLocaleString();
            const profilePic = post.profilePic || loggedInProfilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
            const hasLikedPost = post.likedBy && post.likedBy.includes(walletAddress);
            // Escape post._id to avoid breaking the string
            const safePostId = String(post._id).replace(/"/g, '&quot;');
            html += `
                <div class="post-card" data-post-id="${safePostId}">
                    <img src="${profilePic}" alt="User Profile Picture" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle;">
                    <strong>${post.username || 'Anonymous'}</strong> (${date})
                    <p>${post.content || 'No content'}</p>`;
            if (isAdmin) html += `<button onclick="deletePost('${safePostId}')" data-tooltip="Delete Post">Delete</button>`;
            html += `
                    <p>Likes: <span id="likes-${safePostId}">${post.likes || 0}</span></p>
                    <button onclick="likePost('${safePostId}')" ${hasLikedPost ? 'disabled' : ''}>${hasLikedPost ? 'Liked' : 'Like'}</button>
                    <button onclick="toggleCommentInput('${safePostId}', 'top')">Comment</button>
                    <button onclick="toggleComments('${safePostId}')">Show/Hide Comments (${(post.comments || []).length})</button>
                    <div id="comment-input-${safePostId}-top" style="display: none;">
                        <textarea id="comment-content-${safePostId}-top" class="comment-input" maxlength="280" placeholder="Add a comment (max 280 chars)"></textarea>
                        <button onclick="submitComment('${safePostId}', null)">Submit</button>
                    </div>
                    <div id="comment-section-${safePostId}" class="comment-section"></div>
                </div>
            `;
        });
        document.getElementById('post-list').innerHTML = html;
        sortedPosts.forEach(post => {
            const commentSection = document.getElementById(`comment-section-${post._id}`);
            if (commentSection && commentSection.classList.contains('visible')) {
                renderComments(post.comments || [], post._id);
            }
        });
    } else {
        document.getElementById('post-list').innerHTML = '<p>No posts yet—be the first!</p>';
    }
}




async function updateQuestsDisplay() {
    console.log('[Quests] Updating quest display');
    if (!loggedInUsername) {
        document.getElementById('daily-quests').innerHTML = '<h3>Daily Quests</h3><p>Login to see quests!</p>';
        document.getElementById('weekly-quests').innerHTML = '<h3>Weekly Quests</h3><p>Login to see quests!</p>';
        document.getElementById('limited-quests').innerHTML = '<h3>Limited-Time Quests</h3><p>Login to see quests!</p>';
        return;
    }




    const response = await fetch(`/api/quests/${loggedInUsername}`, {
        method: 'GET',
        credentials: 'include'
    });
    const text = await response.text(); // Get raw text first
    console.log('[Quests] Raw response:', response.status, text);
    const data = JSON.parse(text); // Parse manually
    console.log('[Quests] Server response:', data);
    if (response.ok && data.success) {
        const { daily = [], weekly = [], limited = [] } = data.quests || {};




        let dailyHtml = '<h3>Daily Quests</h3>';
        if (daily.length > 0) {
            console.log('[Quests] Rendering daily quests:', daily);
            daily.forEach(quest => {
                const buttonText = quest.completed && !quest.claimed ? `Claim ${quest.reward} Points` : quest.claimed ? 'Claimed' : 'In Progress';
                const buttonDisabled = quest.claimed || !quest.completed ? 'disabled' : '';
                dailyHtml += `
                    <div class="quest-item">
                        <h4>${quest.title || 'Untitled'}</h4>
                        <p>${quest.description || 'No description'}</p>
                        <div class="quest-progress">
                            <div class="quest-progress-bar" style="width: ${(quest.progress / quest.goal) * 100}%"></div>
                        </div>
                        <p>Progress: ${quest.progress}/${quest.goal}</p>
                        <button onclick="claimQuestReward('${quest.id}', 'daily')" ${buttonDisabled}>${buttonText}</button>
                    </div>
                `;
            });
        } else {
            dailyHtml += '<p>Loading daily quests...</p>';
        }
        document.getElementById('daily-quests').innerHTML = dailyHtml;




        let weeklyHtml = '<h3>Weekly Quests</h3>';
        if (weekly.length > 0) {
            console.log('[Quests] Rendering weekly quests:', weekly);
            weekly.forEach(quest => {
                const buttonText = quest.completed && !quest.claimed ? `Claim ${quest.reward} Points` : quest.claimed ? 'Claimed' : 'In Progress';
                const buttonDisabled = quest.claimed || !quest.completed ? 'disabled' : '';
                weeklyHtml += `
                    <div class="quest-item">
                        <h4>${quest.title || 'Untitled'}</h4>
                        <p>${quest.description || 'No description'}</p>
                        <div class="quest-progress">
                            <div class="quest-progress-bar" style="width: ${(quest.progress / quest.goal) * 100}%"></div>
                        </div>
                        <p>Progress: ${quest.progress}/${quest.goal}</p>
                        <button onclick="claimQuestReward('${quest.id}', 'weekly')" ${buttonDisabled}>${buttonText}</button>
                    </div>
                `;
            });
        } else {
            weeklyHtml += '<p>Loading weekly quests...</p>';
        }
        document.getElementById('weekly-quests').innerHTML = weeklyHtml;




        let limitedHtml = '<h3>Limited-Time Quests</h3>';
        if (limited.length > 0) {
            console.log('[Quests] Rendering limited quests:', limited);
            limited.forEach(quest => {
                const buttonText = quest.completed && !quest.claimed ? `Claim ${quest.reward} Points` : quest.claimed ? 'Claimed' : 'In Progress';
                const buttonDisabled = quest.claimed || !quest.completed ? 'disabled' : '';
                limitedHtml += `
                    <div class="quest-item">
                        <h4>${quest.title || 'Untitled'}</h4>
                        <p>${quest.description || 'No description'}</p>
                        <div class="quest-progress">
                            <div class="quest-progress-bar" style="width: ${(quest.progress / quest.goal) * 100}%"></div>
                        </div>
                        <p>Progress: ${quest.progress}/${quest.goal}</p>
                        <button onclick="claimQuestReward('${quest.id}', 'limited')" ${buttonDisabled}>${buttonText}</button>
                    </div>
                `;
            });
        } else {
            limitedHtml += '<p>Loading limited-time quests...</p>';
        }
        document.getElementById('limited-quests').innerHTML = limitedHtml;
    } else {
        console.error('[Quests] Fetch failed:', data.error || 'Unknown error');
        document.getElementById('daily-quests').innerHTML = '<h3>Daily Quests</h3><p>Error loading—try again!</p>';
        document.getElementById('weekly-quests').innerHTML = '<h3>Weekly Quests</h3><p>Error loading—try again!</p>';
        document.getElementById('limited-quests').innerHTML = '<h3>Limited-Time Quests</h3><p>Error loading—try again!</p>';
    }
}




async function updateProfileDisplay() {
    if (!loggedInUsername) {
        document.getElementById('profile-info').innerHTML = '<p>Please login to view your profile!</p>';
        document.getElementById('profile-pic-options').innerHTML = '';
        document.getElementById('profile-pic-history-list').innerHTML = '';
        return;
    }
    const response = await fetch(`/profile/${loggedInUsername}`, {
        method: 'GET',
        credentials: 'include'
    });
    const text = await response.text();
    console.log('[Profile] Raw response:', response.status, text);
    const data = JSON.parse(text);
    console.log('[Profile] Fetched data:', data);
    if (response.ok && data.success) {
        lemonadePoints = bigInt(data.lemonadePoints || "0");
        stakingPoints = bigInt(data.stakingPoints || "0");
        arcadePoints = bigInt(data.arcadePoints || "0");
        questPoints = bigInt(data.questPoints || "0");
        mintingPoints = bigInt(data.mintingPoints || "0");
        bonusPoints = bigInt(data.bonusPoints || "0");
        loggedInProfilePic = data.profilePic ? `${data.profilePic}` : 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
        console.log('[Profile] loggedInProfilePic set to:', loggedInProfilePic);
        let html = `
            <img id="profile-pic-display" src="${loggedInProfilePic}" alt="Your Profile Picture" onerror="this.src='https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png'; console.log('Profile pic failed:', '${loggedInProfilePic}')">
            <p>Username: ${loggedInUsername}</p>
            <p>Lemonade Points: ${lemonadePoints.toString()}</p>
            <p>Staking Points: ${stakingPoints.toString()}</p>
            <p>Arcade Points: ${arcadePoints.toString()}</p>
            <p>Quest Points: ${questPoints.toString()}</p>
            <p>Minting Points: ${mintingPoints.toString()}</p>
            <p>Bonus Points: ${bonusPoints.toString()}</p>
        `;
        document.getElementById('profile-info').innerHTML = html;


        let optionsHtml = '<h3>Choose a Profile Pic</h3>';
        profilePics.forEach((pic, index) => {
            optionsHtml += `<img id="profile-pic-option-${index}" class="profile-pic-option ${pic === loggedInProfilePic ? 'selected' : ''}" onclick="selectProfilePic('${pic}')" src="${pic}" alt="Profile Pic Option ${index + 1}">`;
        });
        document.getElementById('profile-pic-options').innerHTML = optionsHtml;


        let historyHtml = '';
        if (profilePicHistory.length > 0) {
            profilePicHistory.forEach((pic, index) => {
                historyHtml += `<img id="profile-pic-history-${index}" class="profile-pic-option ${pic === loggedInProfilePic ? 'selected' : ''}" onclick="selectProfilePic('${pic}')" src="${pic}" alt="Previous Profile Pic ${index + 1}">`;
            });
        } else {
            historyHtml = '<p>No previous profile pics yet!</p>';
        }
        document.getElementById('profile-pic-history-list').innerHTML = historyHtml;
        updateProfileIcon();
        updatePointsDisplay();
    } else {
        document.getElementById('profile-info').innerHTML = '<p>Error loading profile—try again!</p>';
        console.error('[Profile] Error:', data.error || response.statusText);
    }
}




async function updateBlogPosts() {
    const response = await fetch('/blog-posts', {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.success) {
        let html = '';
        data.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(post => {
            const postDate = new Date(post.timestamp);
            if (isNaN(postDate.getTime())) {
                console.error(`[UpdateBlogPosts] Invalid timestamp for post: ${post.timestamp}`);
                return;
            }
            html += `<div class="post-card" data-blog-id="${post._id}"><h3>${post.title}</h3><p>${post.content}</p><p><small>Posted on: ${postDate.toLocaleString()}</small></p>`;
            if (isAdmin) html += `<button onclick="deleteBlog('${post._id}')" data-tooltip="Delete Blog">Delete</button>`;
            html += `</div>`;
        });
        document.getElementById('blog-posts').innerHTML = html || '<p>No blog posts yet!</p>';
    } else {
        document.getElementById('blog-posts').innerHTML = '<p>No blog posts yet!</p>';
    }
}




async function updateVideoList() {
    const response = await fetch(`/videos`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    console.log('[Videos] Server response:', data);
    if (response.ok && data.success) {
        let html = '';
        if (data.videos && data.videos.length > 0) {
            const sortedVideos = [...data.videos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            sortedVideos.forEach(video => {
                const videoUrl = video.url || 'https://via.placeholder.com/500x300.mp4?text=Video+Not+Found';
                html += `<div class="video-card" data-video-id="${video._id}"><h3>${video.title}</h3><video controls><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video><p>${video.description}</p><p><small>Uploaded on: ${new Date(video.timestamp).toLocaleString()}</small></p>`;
                if (isAdmin) html += `<button onclick="deleteVideo('${video._id}')" data-tooltip="Delete Video">Delete</button>`;
                html += `</div>`;
            });
            document.getElementById('video-list').innerHTML = html;
        } else {
            document.getElementById('video-list').innerHTML = '<p>No videos yet—upload one in Admin!</p>';
        }
    } else {
        console.error('[Videos] Fetch failed:', data.error || 'Unknown error');
        document.getElementById('video-list').innerHTML = '<p>Error loading videos—check server!</p>';
    }
}




async function selectProfilePic(picUrl) {
    if (!loggedInUsername) {
        alert('Please login to change your profile picture!');
        return;
    }
    const response = await fetch(`/profile/${loggedInUsername}/update-pic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePic: picUrl }),
        credentials: 'include' // Added
    });
    const result = await response.json();
    if (response.ok && result.success) {
        loggedInProfilePic = picUrl;
        document.getElementById('profile-icon').src = picUrl;
        updateProfileDisplay();
        alert('Profile picture updated successfully!');
    } else {
        alert(result.error || 'Failed to update profile picture');
    }
}




        function countTotalComments(comments) {
            return comments ? comments.length : 0;
        }




        function renderComments(comments, postId, parentId = null, depth = 0) {
            const commentSection = document.getElementById(`comment-section-${postId}`);
            if (!commentSection) return;
            console.log(`[RenderComments] Rendering comments for post ${postId}, parentId: ${parentId}, depth: ${depth}`);
            let html = '';
            const filteredComments = (comments || []).filter(comment => 
                comment && comment.content && (parentId === null ? comment.parentId === null : comment.parentId && comment.parentId.toString() === parentId)
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            filteredComments.forEach((comment) => {
                const commentDate = new Date(comment.timestamp).toLocaleString();
                const profilePic = comment.profilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png';
                const hasLikedComment = comment.likedBy && comment.likedBy.includes(walletAddress);
                html += `
                    <div class="comment" style="margin-left: ${depth * 20}px;">
                        <img src="${profilePic}" alt="Comment Profile Picture" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle;">
                        <strong>${comment.username || 'Anonymous'}</strong> (${commentDate})
                        <p>${comment.content}</p>
                        <p>Likes: <span id="comment-likes-${comment._id}">${comment.likes || 0}</span></p>
                        <button onclick="likeComment('${postId}', '${comment._id}')" ${hasLikedComment ? 'disabled' : ''}>${hasLikedComment ? 'Liked' : 'Like'}</button>
                        <button onclick="toggleCommentInput('${postId}', '${comment._id}')">Reply</button>`;
                if (isAdmin) html += `<button onclick="deleteComment('${postId}', '${comment._id}')">Delete</button>`;
                html += `
                        <div id="comment-input-${postId}-${comment._id}" style="display: none;">
                            <textarea id="comment-content-${postId}-${comment._id}" class="comment-input" maxlength="280" placeholder="Add a reply (max 280 chars)"></textarea>
                            <button onclick="submitComment('${postId}', '${comment._id}')">Submit</button>
                        </div>
                        <div class="replies">${renderComments(comments, postId, comment._id, depth + 1)}</div>
                    </div>
                `;
            });
            if (parentId === null) {
                commentSection.innerHTML = html || '<p>No comments yet</p>';
            }
            return html;
        }
        
       async function submitPost() {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to post!');
        return;
    }
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
        alert('Post content cannot be empty');
        return;
    }
    const postButton = document.querySelector('button[onclick="submitPost()"]');
    postButton.disabled = true;
    try {
        const response = await fetch(`/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: walletAddress, content, username: loggedInUsername, profilePic: loggedInProfilePic }),
            credentials: 'include' // Already correct in your latest
        });
        const result = await response.json();
        if (response.ok && result.success) {
            document.getElementById('postContent').value = '';
            trackPost();
            await updatePostsDisplay();
            await updateQuestsDisplay();
            alert('Post submitted successfully! +10 Quest Points');
        } else {
            alert(result.error || 'Failed to submit post');
        }
    } catch (error) {
        console.error('[SubmitPost] Error:', error);
        alert('Failed to submit post: ' + error.message);
    } finally {
        postButton.disabled = false;
    }
}




        async function submitComment(postId, parentId) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect your Solana wallet to comment!');
        return;
    }
    const pathKey = parentId || 'top';
    const textarea = document.getElementById(`comment-content-${postId}-${pathKey}`);
    const content = textarea.value.trim();
    if (!content) {
        alert('Comment content cannot be empty');
        return;
    }
    const commentButton = document.querySelector(`#comment-input-${postId}-${pathKey} button`);
    commentButton.disabled = true;
    try {
        const response = await fetch(`/posts/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId,
                parentId,
                wallet: walletAddress,
                content,
                username: loggedInUsername,
                profilePic: loggedInProfilePic
            }),
            credentials: 'include' // Already correct in your latest
        });
        const result = await response.json();
        if (response.ok && result.success) {
            textarea.value = '';
            await updatePostsDisplay();
            const commentSection = document.getElementById(`comment-section-${postId}`);
            if (commentSection && !commentSection.classList.contains('visible')) {
                toggleComments(postId);
            }
            updateQuestsDisplay();
            alert('Comment submitted successfully!');
        } else {
            alert(result.error || 'Failed to submit comment');
        }
    } catch (error) {
        console.error('[SubmitComment] Error:', error);
        alert('Failed to submit comment: ' + error.message);
    } finally {
        commentButton.disabled = false;
    }
}




async function likePost(postId) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect your Solana wallet to like posts!');
        return;
    }
    const likeButton = event.currentTarget;
    likeButton.disabled = true;
    try {
        const response = await fetch(`/posts/like`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: walletAddress, postId }),
            credentials: 'include' // Added
        });
        const result = await response.json();
        if (response.ok && result.success) {
            document.getElementById(`likes-${postId}`).textContent = result.likes;
            likeButton.textContent = 'Liked';
            likeButton.disabled = true;
            await updatePostsDisplay();
        } else {
            alert(result.error || 'Failed to like post');
            likeButton.disabled = false;
        }
    } catch (error) {
        console.error('[LikePost] Error:', error);
        alert('Failed to like post: ' + error.message);
        likeButton.disabled = false;
    }
}




async function likeComment(postId, commentId) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect your Solana wallet to like comments!');
        return;
    }
    const likeButton = event.currentTarget;
    likeButton.disabled = true;
    try {
        const response = await fetch(`/posts/like-comment`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, commentId, wallet: walletAddress }),
            credentials: 'include' // Added
        });
        const result = await response.json();
        if (response.ok && result.success) {
            document.getElementById(`comment-likes-${commentId}`).textContent = result.likes;
            likeButton.textContent = 'Liked';
            likeButton.disabled = true;
            await updatePostsDisplay();
            alert('Comment liked successfully!');
        } else {
            alert(result.error || 'Failed to like comment');
            likeButton.disabled = false;
        }
    } catch (error) {
        console.error('[LikeComment] Error:', error);
        alert('Failed to like comment: ' + error.message);
        likeButton.disabled = false;
    }
}




async function deleteComment(postId, commentId) {
    if (!isAdmin) {
        alert('Admin access required to delete comments!');
        return;
    }
    const deleteButton = event.currentTarget;
    deleteButton.disabled = true;
    try {
        const response = await fetch(`/posts/delete-comment`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, commentId }),
            credentials: 'include' // Added
        });
        const result = await response.json();
        if (response.ok && result.success) {
            await updatePostsDisplay();
            alert('Comment deleted successfully!');
        } else {
            alert(result.error || 'Failed to delete comment');
        }
    } catch (error) {
        console.error('[DeleteComment] Error:', error);
        alert('Failed to delete comment: ' + error.message);
    } finally {
        deleteButton.disabled = false;
    }
}




function toggleComments(postId) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    if (!commentSection) return;
    commentSection.classList.toggle('visible');
    if (commentSection.classList.contains('visible')) {
        fetch('/posts', { // Added fetch options
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(postsData => {
                const post = postsData.find(p => p._id.toString() === postId);
                if (post) renderComments(post.comments || [], postId);
            });
    }
}




function toggleCommentInput(postId, commentId) {
    const inputId = commentId ? `comment-input-${postId}-${commentId}` : `comment-input-${postId}-top`;
    const inputSection = document.getElementById(inputId);
    if (inputSection) {
        inputSection.style.display = inputSection.style.display === 'none' ? 'block' : 'none';
    } else {
        console.error(`[ToggleCommentInput] Element #${inputId} not found`);
    }
}




        async function claimQuestReward(questId, type) {
    if (!loggedInUsername) {
        alert('Login to claim rewards!');
        return;
    }
    const claimButton = document.querySelector(`button[onclick="claimQuestReward('${questId}', '${type}')"]`);
    claimButton.disabled = true;
    try {
        const response = await fetch(`/claim-quest/${loggedInUsername}/${type}/${questId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            questPoints = bigInt(questPoints).add(result.reward);
            lemonadePoints = bigInt(lemonadePoints).add(result.reward);
            updatePointsDisplay();
            updateProfileDisplay();
            updateQuestsDisplay();
            alert(`Claimed ${result.reward} Quest Points!`);
        } else {
            alert(result.error || 'Failed to claim reward');
        }
    } catch (error) {
        console.error('[ClaimQuest] Error:', error);
        alert('Failed to claim reward: ' + error.message);
    } finally {
        claimButton.disabled = false;
    }
}




async function updateQuestProgressClient(questId, type, increment) {
    if (!loggedInUsername) {
        console.log('[Client Quest Update] Not logged in—skipping');
        return;
    }
    try {
        console.log(`[Client Quest Update] Updating ${questId}, type: ${type}, increment: ${increment}`);
        const response = await fetch(`/quests/${loggedInUsername}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, questId, increment }),
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            console.log(`[Client Quest Update] Success: ${questId} progress now ${result.progress}`);
            await updateQuestsDisplay();
        } else {
            console.error(`[Client Quest Update] Failed: ${result.error}`);
        }
    } catch (error) {
        console.error(`[Client Quest Update] Error: ${error.message}`);
    }
}




async function updateUserPermissions() {
    if (!loggedInUsername || !isAdmin) {
        alert('Admin access required!');
        return;
    }
    const username = document.getElementById('admin-username').value.trim();
    if (!username) {
        alert('Please enter a username!');
        return;
    }
    const isAdmin = document.getElementById('admin-isAdmin').checked;
    const permissions = {
        canPostBlogs: document.getElementById('admin-canPostBlogs').checked,
        canPostVideos: document.getElementById('admin-canPostVideos').checked,
        canDeletePosts: document.getElementById('admin-canDeletePosts').checked,
        canDeleteBlogs: document.getElementById('admin-canDeleteBlogs').checked,
        canDeleteVideos: document.getElementById('admin-canDeleteVideos').checked
    };




    const response = await fetch(`/admin/update-user-permissions/${username}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ isAdmin, permissions }),
        credentials: 'include'
    });




    const result = await response.json();
    if (response.ok && result.success) {
        alert(`Permissions updated for ${username}`);
        document.getElementById('admin-username').value = "";
        document.getElementById('admin-isAdmin').checked = false;
        document.getElementById('admin-canPostBlogs').checked = false;
        document.getElementById('admin-canPostVideos').checked = false;
        document.getElementById('admin-canDeletePosts').checked = false;
        document.getElementById('admin-canDeleteBlogs').checked = false;
        document.getElementById('admin-canDeleteVideos').checked = false;
    } else {
        alert(result.error || 'Failed to update permissions');
    }
}








function trackLoginStreak() {
            const today = new Date().toDateString();
            if (lastLogin !== today) {
                loginStreak = lastLogin ? loginStreak + 1 : 1;
                const pointsEarned = loginStreak >= 5 ? 15 : 5;
                bonusPoints = bonusPoints.add(pointsEarned);
                lemonadePoints = lemonadePoints.add(pointsEarned);
                lastLogin = today;
                updatePointsDisplay();
            }
        }




function updatePointsDisplay() {
            if (typeof lemonadePoints === 'undefined') {
                console.warn('Points not initialized yet—waiting for BigInteger');
                document.getElementById('points-display').textContent = 'Lemonade Points: Loading...';
                return;
            }
            document.getElementById('points-display').textContent = `Lemonade Points: ${lemonadePoints.toString()}`;
        }




async function updateAdminDisplay() {
            const adminContent = document.getElementById('admin-content');
            const adminUpload = document.getElementById('admin-upload');
            const adminPermissions = document.getElementById('admin-permissions');
            if (!loggedInUsername) {
                adminContent.innerHTML = '<p>Please login as an admin to access this section!</p>';
                adminUpload.style.display = 'none';
                adminPermissions.style.display = 'none';
                return;
            }
            if (isAdmin) {
                adminContent.innerHTML = '<p>Welcome, Admin!</p>';
                adminUpload.style.display = 'block';
                adminPermissions.style.display = 'block';
            } else {
                adminContent.innerHTML = '<p>Admin access only!</p>';
                adminUpload.style.display = 'none';
                adminPermissions.style.display = 'none';
            }
        }




async function showContent(sectionId) {
    console.log(`showContent called with: ${sectionId}`);


    const restrictedSections = ['profile', 'videos', 'admin'];
    const isRestricted = restrictedSections.includes(sectionId);
    const finalSectionId = (isRestricted && !loggedInUsername) ? 'home' : sectionId;


    document.querySelectorAll('.content').forEach(content => 
        content.classList.remove('active')
    );
    const contentElement = document.getElementById(finalSectionId);
    if (contentElement) {
        contentElement.classList.add('active');
        document.getElementById('splash-page').style.display = 'none';
        document.getElementById('main-site').style.display = 'block';


        const sectionUpdates = {
            'staking': () => updateNFTDisplay('nft-info'),
            'forum': () => updatePostsDisplay(),
            'quests': () => updateQuestsDisplay(),
            'profile': () => loggedInUsername && updateProfileDisplay(),
            'store': () => loadProducts(), // Already correct
            'blog': () => updateBlogPosts(),
            'videos': () => loggedInUsername && updateVideoList(),
            'admin': () => loggedInUsername && updateAdminDisplay()
        };


        if (sectionUpdates[finalSectionId]) {
            await sectionUpdates[finalSectionId]();
        }
    }


    // Handle game timers
    if (finalSectionId !== 'friends') {
        stopAllGameTimers();
    }


    // Manage building highlights
    document.querySelectorAll('.building').forEach(building => 
        building.classList.remove('active')
    );
    const activeBuilding = document.getElementById(`building-${finalSectionId}`);
    if (activeBuilding) {
        activeBuilding.classList.add('active');
    }


    // Menu container visibility
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.classList.toggle('active', finalSectionId !== 'what-is-lcc');
    }


    // Track section visit
    if (loggedInUsername && finalSectionId !== 'quests') {
        trackSectionVisit(finalSectionId);
    }


    // Handle email verification
    const urlParams = new URLSearchParams(window.location.search);
    if (finalSectionId === 'home' && urlParams.get('verified') === 'true') {
        alert('Email verified successfully! Please sign in to continue.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


function toggleAuth() {
    if (loggedInUsername) logout();
    else showContent('home');
 }


async function mintNFT(button) {
    console.log('[Mint] === HEX VERSION LOADED ===');
    console.log('[Mint] === TWO TX MODE ===');
    console.log('[Mint] Checking Solana Web3 availability...');
    showMintConfirmModal(button); // Trigger the modal instead of minting directly
}

async function stakeNFT(mintAddress) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to stake!');
        return;
    }
    showStakeConfirmModal(mintAddress); // Trigger the modal instead of direct staking
}
   

function updateStakeButton(mintAddress) {
    // No-op for now—could add dynamic UI updates if needed
    console.log(`[Stake] Lock period updated for ${mintAddress}`);
}    

async function unstakeNFT(mintAddress) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to unstake!');
        return;
    }
    const unstakeButton = event.currentTarget;
    unstakeButton.classList.add('loading'); // Still applies cursor: wait
    try {
        const response = await fetch(`/unstake/${loggedInUsername}/${mintAddress}`, {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            await updateProfileDisplay();
            await updateNFTDisplay('nft-info');
            alert('NFT unstaked successfully!');
        } else {
            alert(result.error || 'Failed to unstake NFT');
        }
    } catch (error) {
        console.error('[Unstake] Error:', error);
        alert('Failed to unstake NFT: ' + error.message);
    } finally {
        unstakeButton.classList.remove('loading');
    }
}

let currentMintAddress = null;
let currentButton = null;

async function evolveNFT(mintAddress, button) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to evolve!');
        return;
    }
    if (!lemonadePoints || lemonadePoints.lt(10)) {
        alert('Need 10 Lemonade Points to evolve!');
        return;
    }

    currentMintAddress = mintAddress;
    currentButton = button; // Capture the exact button clicked
    console.log('[Evolve] Setting currentButton:', currentButton);

    const modal = document.getElementById('evolve-confirm-modal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('[EvolveConfirm] Modal element not found');
    }
}

async function confirmEvolve() {
    if (!currentMintAddress || !currentButton) {
        console.error('[ConfirmEvolve] Missing mintAddress or button');
        closeEvolveConfirmModal();
        return;
    }
 const evolveGif = document.getElementById('evolve-loading-gif');
    if (evolveGif) evolveGif.style.display = 'block';
    try {
        const response = await fetch(`/evolve/${loggedInUsername}/${currentMintAddress}`, {
            method: 'GET',
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            lemonadePoints = bigInt(result.lemonadePoints || "0");
            stakingPoints = bigInt(result.stakingPoints || "0");
            arcadePoints = bigInt(result.arcadePoints || "0");
            questPoints = bigInt(result.questPoints || "0");
            mintingPoints = bigInt(result.mintingPoints || "0");
            bonusPoints = bigInt(result.bonusPoints || "0");
            updatePointsDisplay();
            alert('NFT evolved successfully!');
            await updateNFTDisplay('nft-info');
            await updateQuestProgressClient('lemon-evolutionist', 'weekly', 1);
            await updateQuestProgressClient('million-lemon-bash', 'limited', 1);
        } else {
            alert(result.error || 'Failed to evolve NFT');
        }
    } catch (error) {
        console.error('[Evolve] Client Error:', error);
        alert('Failed to evolve NFT: ' + error.message);
    } finally {
        if (evolveGif) evolveGif.style.display = 'none';
        closeEvolveConfirmModal();
    }
}

function closeEvolveConfirmModal() {
    const modal = document.getElementById('evolve-confirm-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentMintAddress = null;
    currentButton = null;
}

let stakeMintAddress = null;

function showStakeConfirmModal(mintAddress) {
    stakeMintAddress = mintAddress;
    const lockPeriodSelect = document.getElementById(`lock-period-${mintAddress}`);
    const lockPeriodMonths = parseInt(lockPeriodSelect.value, 10);
    const message = `Whoa, you’re locking in your NFT for ${lockPeriodMonths} month${lockPeriodMonths > 1 ? 's' : ''}! 🍋 Once staked, it’s stuck—no trading or selling ‘til it’s ripe, but you can still evolve it into a zesty masterpiece. Ready to grow some serious lemon vibes? Confirm to stake!`;
    document.getElementById('stake-confirm-message').textContent = message;
    const modal = document.getElementById('stake-confirm-modal');
    if (modal) modal.classList.add('active');
}

function closeStakeConfirmModal() {
    const modal = document.getElementById('stake-confirm-modal');
    if (modal) modal.classList.remove('active');
    stakeMintAddress = null;
}

async function confirmStake() {
    if (!stakeMintAddress) return;
    const lockPeriodSelect = document.getElementById(`lock-period-${stakeMintAddress}`);
    const lockPeriodMonths = parseInt(lockPeriodSelect.value, 10);
    const stakeGif = document.getElementById('stake-loading-gif');
    if (stakeGif) stakeGif.style.display = 'block';
    try {
        const response = await fetch(`/stake/${loggedInUsername}/${stakeMintAddress}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lockPeriodMonths }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            await updateProfileDisplay();
            await updateNFTDisplay('nft-info');
            alert(`NFT staked successfully for ${lockPeriodMonths} month${lockPeriodMonths > 1 ? 's' : ''}!`);
        } else {
            alert(result.error || 'Failed to stake NFT');
        }
    } catch (error) {
        console.error('[Stake] Error:', error);
        alert('Failed to stake NFT: ' + error.message);
    } finally {
        if (stakeGif) stakeGif.style.display = 'none';
        closeStakeConfirmModal();
    }
}

let mintButton = null;

function showMintConfirmModal(button) {
    if (!window.solana || !window.solana.isPhantom) {
        alert('Phantom wallet not found! Please install Phantom.');
        return;
    }
    if (!loggedInUsername) {
        alert('Please login to mint an NFT!');
        return;
    }
    mintButton = button;
    console.log('[Mint] Showing confirmation modal, button:', mintButton);
    const modal = document.getElementById('mint-confirm-modal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('[MintConfirm] Modal element not found');
    }
}

function closeMintConfirmModal() {
    const modal = document.getElementById('mint-confirm-modal');
    if (modal) modal.classList.remove('active');
    mintButton = null;
}

async function confirmMint() {
    if (!mintButton) return;
    const mintGif = document.getElementById('mint-loading-gif');
    if (mintGif) mintGif.style.display = 'block';
    const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
    try {
        if (!window.solana || !window.solana.isPhantom) {
            throw new Error('Phantom wallet not detected');
        }
        await window.solana.connect();
        const publicKey = window.solana.publicKey?.toString();
        if (!publicKey) throw new Error('Failed to get wallet public key');
        console.log('[Mint] Phantom wallet connected:', publicKey);

        // Check balance
        const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));
        const minBalanceNeeded = 0.1 * solanaWeb3.LAMPORTS_PER_SOL + 10000; // 0.1 SOL + fees
        if (balance < minBalanceNeeded) {
            throw new Error('Insufficient SOL balance (need ~0.101 SOL)');
        }

        console.log('[Mint] Fetching mint transaction...');
        const username = loggedInUsername;
        if (!username) throw new Error('Please login to mint!');

        const response = await fetch('https://www.lemonclubcollective.com/api/mint-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: publicKey, username })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log('[Mint] Server response:', data);

        if (!data.transaction1 || !data.transaction2) {
            throw new Error('Invalid transaction data from server');
        }

        console.log('[Mint] Signing Tx1 with Phantom...');
        const tx1Buffer = new Uint8Array(data.transaction1.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const transaction1 = solanaWeb3.Transaction.from(tx1Buffer);
        console.log('[Mint] Transaction 1 instructions:', transaction1.instructions.map(i => ({
            programId: i.programId.toBase58(),
            keys: i.keys.map(k => ({ pubkey: k.pubkey.toBase58(), isSigner: k.isSigner, isWritable: k.isWritable })),
            data: i.data.toString('hex')
        })));
        const signedTx1 = await window.solana.signTransaction(transaction1);
        const signature1 = await connection.sendRawTransaction(signedTx1.serialize());
        console.log('[Mint] Transaction 1 Signature:', signature1);
        alert(`Transaction 1 Signature: ${signature1}`); // Alert the signature for easy access

        await connection.confirmTransaction({
            signature: signature1,
            blockhash: transaction1.recentBlockhash,
            lastValidBlockHeight: (await connection.getBlockHeight()) + 150
        }, { commitment: 'confirmed', maxRetries: 10 });
        console.log('[Mint] Tx1 Confirmed');

        console.log('[Mint] Signing Tx2 with Phantom...');
        const tx2Buffer = new Uint8Array(data.transaction2.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const transaction2 = solanaWeb3.Transaction.from(tx2Buffer);
        console.log('[Mint] Transaction 2 instructions:', transaction2.instructions.map(i => ({
            programId: i.programId.toBase58(),
            keys: i.keys.map(k => ({ pubkey: k.pubkey.toBase58(), isSigner: k.isSigner, isWritable: k.isWritable })),
            data: i.data.toString('hex')
        })));
        const signedTx2 = await window.solana.signTransaction(transaction2);
        const signature2 = await connection.sendRawTransaction(signedTx2.serialize());
        console.log('[Mint] Transaction 2 Signature:', signature2);
        alert(`Transaction 2 Signature: ${signature2}`); // Alert the signature for easy access

        await connection.confirmTransaction({
            signature: signature2,
            blockhash: transaction2.recentBlockhash,
            lastValidBlockHeight: (await connection.getBlockHeight()) + 150
        }, { commitment: 'confirmed', maxRetries: 10 });
        console.log('[Mint] Tx2 Confirmed');

        mintingPoints = bigInt(mintingPoints || 0).add(25);
        lemonadePoints = bigInt(lemonadePoints || 0).add(25);
        updatePointsDisplay();

        await updateNFTDisplay('nft-info');
        await updateQuestProgressClient('launch-party', 'limited', 1);
        alert('NFT minted successfully for 0.1 SOL! Check your Phantom wallet.');
    } catch (error) {
        console.error('[Mint] Error:', error.message);
        alert('Failed to mint NFT: ' + error.message);
    } finally {
        if (mintGif) mintGif.style.display = 'none';
        closeMintConfirmModal();
    }
}

async function trackPost() {
            if (!loggedInUsername) return;
            await updateQuestProgressClient('citrus-explorer', 'daily', 1);
            await updateQuestProgressClient('lemon-bard', 'weekly', 1);
        }

function showOrderHistory() {
    if (!loggedInUsername) {
        alert('Please login to view your order history!');
        return;
    }
    const modal = document.getElementById('order-history-modal');
    if (modal) {
        modal.classList.add('active');
        fetchOrderHistory();
    } else {
        console.error('[OrderHistory] Modal element not found');
    }
}

function closeOrderHistoryModal() {
    const modal = document.getElementById('order-history-modal');
    if (modal) modal.classList.remove('active');
}

async function fetchOrderHistory() {
    const content = document.getElementById('order-history-content');
    try {
        const response = await fetch(`/profile/${loggedInUsername}/orders`, {
            method: 'GET',
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            if (result.orders && result.orders.length > 0) {
                let html = '';
                result.orders.forEach(order => {
                    html += `
                        <div class="order-history-item">
                            <p><strong>Order ID:</strong> ${order.orderId}</p>
                            <p><strong>Product:</strong> ${order.productTitle}</p>
                            <img src="${order.image || 'https://via.placeholder.com/100'}" alt="${order.productTitle}">
                            <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                            <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
                        </div>
                    `;
                });
                content.innerHTML = html;
            } else {
                content.innerHTML = `
                    <p>No orders here yet!</p>
                    <button onclick="showContent('store'); closeOrderHistoryModal()" style="margin: 10px; padding: 10px 20px; background: linear-gradient(45deg, #ffeb3b, #ff4500); color: white; border: none; border-radius: 10px; cursor: pointer;">Get Merch</button>
                `;
            }
        } else {
            content.innerHTML = '<p>Error loading order history—try again!</p>';
            console.error('[OrderHistory] Fetch failed:', result.error);
        }
    } catch (error) {
        console.error('[OrderHistory] Error:', error);
        content.innerHTML = '<p>Error loading order history—try again!</p>';
    }
}

 async function trackSocialVisit() {
            if (!loggedInUsername) return;
            try {
                console.log('[SocialVisit] Tracking social link visit');
                await updateQuestProgressClient('social-squeeze', 'daily', 1);
            } catch (error) {
                console.error(`[SocialVisit] Error: ${error.message}`);
            }
        }




        async function trackSectionVisit(sectionId) {
            if (!loggedInUsername || sectionId === 'home' || sectionId === 'what-is-lcc') return;
            if (!sectionsVisitedToday.has(sectionId)) {
                sectionsVisitedToday.add(sectionId);
                await updateQuestProgressClient('section-adventurer', 'daily', 1);
            }
        }


async function updateStoreDisplay() {
    console.log('[Store] Starting updateStoreDisplay');
    const storeProducts = document.getElementById('product-list');
    if (!storeProducts) {
        console.error('[Store] Product list element not found');
        return;
    }
    if (!loggedInUsername) {
        console.log('[Store] User not logged in');
        storeProducts.innerHTML = '<p>Please login to view the store!</p>';
        return;
    }


    try {
        console.log('[Store] Fetching products from /printify-products');
        const response = await fetch(`/printify-products`);
        const data = await response.json();
        console.log('[Store] Response from /printify-products:', data);
        console.log('[Store] Response status:', response.status);
        if (!response.ok || !data.success) {
            storeProducts.innerHTML = '<p>Error loading products—try again!</p>';
            console.error('[Store] Error:', data.error || response.statusText, data.details);
            return;
        }


        const products = data.products || [];
        console.log('[Store] Products received:', products);
        let html = products.length ? '' : '<p>No products available—check back soon!</p>';
        products.forEach(product => {
            const price = product.variants[0]?.price / 100 || 0; // Convert cents to dollars
            html += `
                <div class="product-card">
                    <img src="${product.images[0]?.src || 'https://via.placeholder.com/150'}" alt="${product.title}" style="max-width: 150px; border-radius: 10px;">
                    <p>${product.title}</p>
                    <p>$${price.toFixed(2)}</p>
                    <button onclick="buyMerch('${product.id}', ${price})">Buy Now</button>
                </div>
            `;
        });
        storeProducts.innerHTML = html;
    } catch (error) {
        console.error('[Store] Error:', error.message);
        storeProducts.innerHTML = '<p>Error loading products—try again!</p>';
    }
}




// Placeholder for buyMerch (we'll implement this in the next step)
function buyMerch(productId, price) {
    alert(`Buying product ${productId} for $${price.toFixed(2)} - Payment integration coming soon!`);
}




       async function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email').value.trim();
    if (!email) {
        alert('Please enter an email address!');
        return;
    }
    const response = await fetch(`/subscribe-newsletter`, { // Fixed URL syntax
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success) {
        if (loggedInUsername) {
            bonusPoints = bonusPoints.add(25);
            lemonadePoints = lemonadePoints.add(25);
            updatePointsDisplay();
            alert('Subscribed successfully! +25 Bonus Points');
        } else {
            alert('Subscribed successfully!');
        }
        document.getElementById('newsletter-email').value = '';
    } else {
        alert(result.error || 'Failed to subscribe');
    }
}




async function uploadProfilePic() {
    if (!loggedInUsername) {
        alert('Please login to upload a profile picture!');
        return;
    }
    const fileInput = document.getElementById('profile-pic-upload');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image to upload!');
        return;
    }
    const formData = new FormData();
    formData.append('profilePic', file);
        const response = await fetch(`/upload-profile-pic/${loggedInUsername}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success) {
        loggedInProfilePic = result.profilePicUrl;
        profilePicHistory.push(loggedInProfilePic);
        document.getElementById('profile-icon').src = loggedInProfilePic;
        fileInput.value = '';
        updateProfileDisplay();
        alert('Profile picture uploaded successfully!');
    } else {
        alert(result.error || 'Failed to upload profile picture');
    }
}




 async function uploadVideo() {
    if (!loggedInUsername || !isAdmin) {
        alert('Admin access required to upload videos!');
        return;
    }
    const fileInput = document.getElementById('video-upload');
    const titleInput = document.getElementById('video-title');
    const descInput = document.getElementById('video-desc');
    if (!fileInput.files[0]) {
        alert('Please select a video file!');
        return;
    }
    const fileSizeMB = fileInput.files[0].size / (1024 * 1024);
    console.log(`[Video Upload] File size: ${fileSizeMB} MB`);
    if (fileSizeMB > 1024) {
        alert('File size exceeds 1GB limit!');
        return;
    }




    const formData = new FormData();
    formData.append('video', fileInput.files[0]);
    formData.append('title', titleInput.value);
    formData.append('description', descInput.value);




    const uploadButton = document.querySelector('button[onclick="uploadVideo()"]');
    uploadButton.disabled = true;
    try {
        const response = await fetch(`/upload-video`, { // Fixed URL syntax
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${text}`);
        }




        const result = await response.json();
        console.log('[Video Upload] Response:', result);
        if (response.ok && result.success) {
            alert('Video uploaded successfully!');
            updateVideoList();
            titleInput.value = '';
            descInput.value = '';
            fileInput.value = '';
        } else {
            alert(result.error || 'Failed to upload video');
        }
    } catch (error) {
        console.error('[VideoUpload] Error:', error);
        alert('Failed to upload video: ' + error.message);
    } finally {
        uploadButton.disabled = false;
    }
}




async function postBlog() {
    if (!loggedInUsername || !isAdmin) {
        alert('Admin login required to post blogs!');
        return;
    }
    const title = document.getElementById('blog-title').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    if (!title || !content) {
        alert('Please enter both title and content!');
        return;
    }
    const postButton = document.querySelector('button[onclick="postBlog()"]');
    postButton.disabled = true;
    try {
        const response = await fetch(`/blog-posts`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, username: loggedInUsername }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            alert('Blog posted successfully!');
            document.getElementById('blog-title').value = '';
            document.getElementById('blog-content').value = '';
            updateBlogPosts();
        } else {
            alert(result.error || 'Failed to post blog');
        }
    } catch (error) {
        console.error('[PostBlog] Error:', error);
        alert('Failed to post blog: ' + error.message);
    } finally {
        postButton.disabled = false;
    }
}


async function toggleWalletConnection() {
    console.log('toggleWalletConnection called');
    const connectBtnStaking = document.getElementById('connect-wallet-btn-staking');
    if (!connectBtnStaking) {
        console.error('Connect Wallet button not found');
        return;
    }

    if (!loggedInUsername) {
        alert('Please login to connect your Solana wallet!');
        showContent('home'); // Redirect to home for login
        return;
    }

    if (walletAddress) {
        disconnectWallet();
    } else if ('solana' in window) {
        console.log('Solana object found:', window.solana);
        const provider = window.solana;
        try {
            const response = await provider.connect();
            walletAddress = provider.publicKey?.toString();
            if (!walletAddress) {
                throw new Error('No public key received from wallet');
            }
            connectBtnStaking.textContent = 'Disconnect Solana Wallet';
            console.log('Updated button text to Disconnect Solana Wallet');
            document.getElementById('wallet-status').textContent = `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            console.log('Wallet connected:', walletAddress);
        } catch (error) {
            console.error('[Wallet] Connection failed:', error);
            alert('Wallet connection failed—check Phantom: ' + error.message);
        }
    } else {
        alert('Install Phantom wallet!');
        window.open('https://phantom.app/', '_blank');
    }
}


function disconnectWallet() {
            if (window.solana) window.solana.disconnect();
            walletAddress = null;
            const connectBtnStaking = document.getElementById('connect-wallet-btn-staking');
            if (connectBtnStaking) connectBtnStaking.textContent = 'Connect Solana Wallet';
            document.getElementById('wallet-status').textContent = 'Wallet not connected';
 }


async function subscribe() {
    if (!loggedInUsername) {
        alert('Please login to subscribe!');
        return;
    }
    const response = await fetch(`/create-subscription`, { // Fixed URL syntax
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUsername }),
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success && result.clientSecret) {
        const { error } = await stripeClient.redirectToCheckout({ sessionId: result.clientSecret });
        if (error) alert('Error during Stripe checkout: ' + error.message);
    } else {
        alert(result.error || 'Failed to create subscription');
    }
}




        async function buyMerch(productId, price) {
    if (!walletAddress) {
        alert('Connect Solana wallet to buy!');
        return;
    }
    if (!loggedInUsername) {
        alert('Please login to buy merch!');
        return;
    }


    const address = prompt('Enter shipping address (name, street, city, state, zip, country):');
    if (!address) return;


    try {
        // Step 1: Create a Coinbase charge
        const chargeResponse = await fetch('/create-charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loggedInUsername, amount: price }),
            credentials: 'include'
        });
        const chargeResult = await chargeResponse.json();
        if (!chargeResponse.ok || !chargeResult.success) {
            throw new Error(chargeResult.error || 'Failed to create charge');
        }


        // Step 2: Open Coinbase payment window
        window.open(chargeResult.chargeUrl, '_blank');


        // Step 3: Place Printify order after payment (assuming payment succeeds)
        const orderResponse = await fetch('/printify-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loggedInUsername, productId, address }),
            credentials: 'include'
        });
        const orderResult = await orderResponse.json();
        if (orderResult.success) {
            alert('Order placed! ID: ' + orderResult.orderId);
        } else {
            throw new Error(orderResult.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('[BuyMerch] Error:', error.message);
        alert('Failed to complete purchase: ' + error.message);
    }
}




        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' + secs : secs}`;
 }




        async function startGame(gameId) {
            if (!loggedInUsername) {
                alert('Please login to play games!');
                return;
            }
            stopAllGameTimers();
            const iframe = document.getElementById(`game-${gameId}`);
            const startBtn = iframe.parentElement.querySelector('.start-game-btn');
            const stopBtn = iframe.parentElement.querySelector('.stop-game-btn');
            const timerDisplay = document.getElementById(`timer-${gameId}`);
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            iframe.src = iframe.getAttribute('data-src');
            iframe.style.display = 'block';
            startTime = new Date();
            let secondsElapsed = 0;
            timerDisplay.textContent = `Time: ${formatTime(secondsElapsed)}`;
            gameTimers[gameId] = setInterval(() => {
                secondsElapsed = Math.floor((new Date() - startTime) / 1000);
                timerDisplay.textContent = `Time: ${formatTime(secondsElapsed)}`;
            }, 1000);
        }




        async function stopGame(gameId) {
            const iframe = document.getElementById(`game-${gameId}`);
            const startBtn = iframe.parentElement.querySelector('.start-game-btn');
            const stopBtn = iframe.parentElement.querySelector('.stop-game-btn');
            const timerDisplay = document.getElementById(`timer-${gameId}`);
            if (gameTimers[gameId]) {
                clearInterval(gameTimers[gameId]);
                delete gameTimers[gameId];
                const secondsElapsed = Math.floor((new Date() - startTime) / 1000);
                const minutesPlayed = Math.floor(secondsElapsed / 60);
                timerDisplay.textContent = `Time: ${formatTime(secondsElapsed)}`;
                console.log(`[StopGame] Played for ${secondsElapsed} seconds, ${minutesPlayed} minutes`);
                if (minutesPlayed > 0) await updatePlaytime(minutesPlayed);
                if (minutesPlayed >= 5) document.getElementById(`claim-${gameId}`).disabled = false;
                startTime = null;
            }
            iframe.style.display = 'none';
            iframe.src = '';
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
 }




      async function updatePlaytime(minutes) {
    if (!loggedInUsername) return;
    const response = await fetch(`/playtime/${loggedInUsername}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
        credentials: 'include'
    });
    const result = await response.json();
    if (result.success) {
        arcadePoints = bigInt(result.arcadePoints || "0");
        lemonadePoints = bigInt(result.lemonadePoints || "0");
        updatePointsDisplay();
        updateProfileDisplay();
    }
}




async function claimVictory(gameId) {
    if (!loggedInUsername) {
        alert('Please login to claim victory!');
        return;
    }
    const response = await fetch(`/claim-victory/${loggedInUsername}/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success) {
        const claimBtn = document.getElementById(`claim-${gameId}`);
        claimBtn.textContent = 'Claimed!';
        claimBtn.disabled = true;
        arcadePoints = arcadePoints.add(25);
        lemonadePoints = lemonadePoints.add(25);
        updatePointsDisplay();
        await updateQuestProgressClient('arcade-master', 'weekly', 1);
        alert('Victory claimed successfully! +25 Arcade Points');
    } else {
        alert(result.error || 'Failed to claim victory');
    }
}




async function fetchVictoryClaims() {
    if (!loggedInUsername) return;
    const response = await fetch(`/profile/${loggedInUsername}`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if (data.success) {
        ['big-dill', 'owl-capone', 'lenny-lemon'].forEach(gameId => {
            const claimBtn = document.getElementById(`claim-${gameId}`);
            if (claimBtn && data.arcadePoints >= 25) {
                claimBtn.textContent = 'Claimed!';
                claimBtn.disabled = true;
            }
        });
    }
}




async function submitTicket(event) {
    event.preventDefault();
    const name = document.getElementById('ticketName').value.trim();
    const email = document.getElementById('ticketEmail').value.trim();
    const message = document.getElementById('ticketMessage').value.trim();
    if (!name || !email || !message) {
        alert('Please fill all fields!');
        return;
    }
    const response = await fetch('/submit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
        credentials: 'include'
    });
    console.log('[SubmitTicket] Response status:', response.status);
    const result = await response.json();
    console.log('[SubmitTicket] Response data:', result);
    if (response.ok && result.success) {
        alert('Ticket submitted successfully! Ticket #' + result.ticketId);
        document.getElementById('ticketName').value = '';
        document.getElementById('ticketEmail').value = '';
        document.getElementById('ticketMessage').value = '';
    } else {
        alert(result.error || 'Failed to submit ticket');
    }
}




async function claimQuest(type, questId) {
    const response = await fetch(`/quests/${loggedInUsername}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, type }),
        credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.success) {
        alert(`Claimed ${data.reward} points!`);
        updateQuestsDisplay();
    } else {
        alert(data.error || 'Failed to claim reward');
    }
}
        




       async function deleteVideo(id) {
    if (!isAdmin) {
        alert('Admin access required to delete videos!');
        return;
    }
    const deleteButton = document.querySelector(`button[onclick="deleteVideo('${id}')"]`);
    deleteButton.disabled = true;
    try {
        const response = await fetch(`/delete-video`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            alert('Video deleted successfully!');
            await updateVideoList();
        } else {
            alert(result.error || 'Failed to delete video');
        }
    } catch (error) {
        console.error('[DeleteVideo] Error:', error);
        alert('Failed to delete video: ' + error.message);
    } finally {
        deleteButton.disabled = false;
    }
}




async function deleteBlog(id) {
    if (!isAdmin) {
        alert('Admin access required to delete blogs!');
        return;
    }
    const deleteButton = document.querySelector(`button[onclick="deleteBlog('${id}')"]`);
    if (deleteButton) deleteButton.disabled = true;
    try {
        const response = await fetch(`/delete-blog`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            alert('Blog deleted successfully!');
            await updateBlogPosts();
        } else {
            alert(result.error || 'Failed to delete blog');
        }
    } catch (error) {
        console.error('[DeleteBlog] Error:', error);
        alert('Failed to delete blog: ' + error.message);
    } finally {
        if (deleteButton) deleteButton.disabled = false;
    }
}


async function deletePost(postId) {
    if (!isAdmin) return alert('Admin access required!');
    const response = await fetch(`/delete-post`, { // Fixed URL syntax
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success) {
        alert('Post deleted successfully!');
        updatePostsDisplay();
    } else {
        alert(result.error || 'Failed to delete post');
    }
}