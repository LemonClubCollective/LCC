// public/scripts.js
let loggedInUsername = null;
let loggedInProfilePic = null;
let isAdmin = false;
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
        const stripeClient = Stripe('pk_test_51Qxc9v03zQcNJCYZZPxGZKDuXZvINOWJA93uOptLggu4UtWPdTHfGfTKXf6TaGzsPFkLdDv2helvmmMBEopNijvO00EprZqruE');
        let postsToday = 0;
        let socialVisitsToday = 0;
        let arcadePlayToday = 0;
        let sectionsVisitedToday = new Set();
                   
        
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
    const profilePicUrl = loggedInProfilePic || defaultProfilePic;

    const img = new Image();
    img.onerror = () => {
        console.warn('[ProfileIcon] Failed to load profile image, using default');
        profileIcon.src = defaultProfilePic;
    };
    img.onload = () => {
        profileIcon.src = profilePicUrl;
    };
    img.src = profilePicUrl;
}

async function login() {
    console.log('[Login] Login button clicked');
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
        const result = await response.json(); // Read once here
        console.log('[Login] Response:', response.status, result); // Log status and parsed JSON
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
    const response = await fetch('https://lemonclub-env2.us-east-1.elasticbeanstalk.com/api/printify-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.success && data.data.length > 0) {
        let html = '';
        data.data.forEach(product => {
            // Escape quotes in product.title to avoid breaking the string
            const safeTitle = product.title.replace(/"/g, '&quot;');
            html += `<div class="nft-card"><img id="product-img-${product.id}" alt="${safeTitle}" style="max-width: 200px;"><p>${safeTitle} - $${product.variants[0].price / 100}</p><button onclick="buyMerch('${product.id}', ${product.variants[0].price / 100})">Buy with Crypto</button></div>`;
        });
        document.getElementById('product-list').innerHTML = html;

        data.data.forEach(product => {
            const img = document.getElementById(`product-img-${product.id}`);
            if (product.images && product.images[0] && product.images[0].src) {
                img.src = product.images[0].src;
            } else {
                img.src = 'https://via.placeholder.com/200';
            }
        });
    } else {
        document.getElementById('product-list').innerHTML = `<p>${data.message || 'No products available yet'}</p>`;
    }
}

  async function updateNFTDisplay(containerId, showButtons = true) {
    if (!loggedInUsername) {
        document.getElementById(containerId).innerHTML = '<p>Please login to manage your Lemon NFTs!</p>';
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
            document.getElementById(containerId).innerHTML = '<p>No NFTs yet—mint one to start growing!</p>';
            return;
        }
        let html = '';
        nfts.forEach(nft => {
            const stageName = nft.name || 'Lemon Seed';
            const mintAddress = nft.mintAddress;
            const imageUri = nft.imageUri ? nft.imageUri.replace('3000', '3001') : `/output/nft_${Date.now()}.png`;
            const staked = nft.staked || false;
            console.log(`[NFT Display] NFT ${mintAddress} staked: ${staked}`);
            const baseStageName = stageName.split('#')[0].trim();
            const canEvolve = (typeof lemonadePoints.gte === 'function' ? lemonadePoints.gte(10) : Number(lemonadePoints) >= 10) && baseStageName !== 'Lemon Tree';
            html += `<div class="nft-card ${staked ? 'staked' : ''}">
                <img id="nft-img-${mintAddress}" alt="${stageName}" src="${imageUri}" 
                    onerror="this.onerror=null; this.src='https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/magicseed.png'; console.log('NFT image failed:', '${imageUri}')" 
                    style="max-width: 200px;">
                <p>${stageName}</p>
                <p>Mint Address: ${mintAddress.slice(0, 8)}...</p>
                <div class="nft-card-buttons">`;
            if (showButtons) {
                html += `<button class="nft-card-button ${staked ? 'unstake-btn' : 'stake-btn'}" 
                    onclick="${staked ? 'unstakeNFT' : 'stakeNFT'}('${mintAddress}')">
                    ${staked ? 'Unstake' : 'Stake'}
                </button>`;
                html += `<button class="nft-card-button evolve-btn" onclick="evolveNFT('${mintAddress}', this)" 
                    ${canEvolve ? '' : 'disabled'}>Evolve</button>`;
            }
            html += '</div></div>';
        });
        console.log('[NFT Display] Generated HTML:', html);
        document.getElementById(containerId).innerHTML = html;
    } else {
        document.getElementById(containerId).innerHTML = '<p>Error loading NFTs—try again!</p>';
    }
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
        credentials: 'include' // Moved inside fetch options
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
    if ((sectionId === 'profile' || sectionId === 'videos' || sectionId === 'staking' || sectionId === 'admin') && !loggedInUsername) {
        sectionId = 'home';
    }
    document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
    const contentElement = document.getElementById(sectionId);
    if (contentElement) {
        contentElement.classList.add('active');
        document.getElementById('splash-page').style.display = 'none';
        document.getElementById('main-site').style.display = 'block';
        if (sectionId === 'staking' && loggedInUsername) {
            await updateNFTDisplay('nft-info');
        } else if (sectionId === 'forum') {
            updatePostsDisplay();
        } else if (sectionId === 'quests') {
            updateQuestsDisplay();
        } else if (sectionId === 'profile' && loggedInUsername) {
            updateProfileDisplay();
        } else if (sectionId === 'store') {
            loadProducts();
        } else if (sectionId === 'blog') {
            updateBlogPosts();
        } else if (sectionId === 'videos' && loggedInUsername) {
            updateVideoList();
        } else if (sectionId === 'admin' && loggedInUsername) {
            updateAdminDisplay();
        }
    }

    if (sectionId !== 'friends') stopAllGameTimers();
    document.querySelectorAll('.building').forEach(building => building.classList.remove('active'));
    const activeBuilding = document.getElementById(`building-${sectionId}`);
    if (activeBuilding) activeBuilding.classList.add('active');
    const menuContainer = document.getElementById('menu-container');
    if (sectionId === 'what-is-lcc') {
        menuContainer.classList.remove('active');
    } else {
        menuContainer.classList.add('active');
    }
    if (loggedInUsername && sectionId !== 'quests') trackSectionVisit(sectionId);
}

function toggleAuth() {
    if (loggedInUsername) logout();
    else showContent('home');
 }

async function mintNFT(button) {
    console.log('[Mint] === HEX VERSION LOADED ===');
    console.log('[Mint] === TWO TX MODE ===');
    console.log('[Mint] Checking Solana Web3 availability...');
    if (!window.solana || !window.solana.isPhantom) {
        alert('Phantom wallet not found! Please install Phantom.');
        return;
    }
    console.log('[Mint] Solana Web3 confirmed:', window.solana);

    const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
    button.classList.add('loading');

    try {
        await window.solana.connect();
        const publicKey = window.solana.publicKey.toString();
        console.log('[Mint] Phantom wallet connected:', publicKey);
        console.log('[Mint] Fetching mint transaction...');
        const username = loggedInUsername || 'tester';
        if (!username) throw new Error('Please login to mint!');

        const response = await fetch('https://lemonclubcollective.com/api/mint-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: publicKey, username: username })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log('[Mint] Full Server Response:', data);
        console.log('[Mint] Mint Public Key from server:', data.mintPublicKey);
        const imageUri = `https://lemonclubcollective.com/output/nft_${Date.now()}.png`;

        console.log('[Mint] Signing Tx1 with Phantom...');
        if (!data.transaction1) throw new Error('Transaction1 missing from server response!');
        const tx1Buffer = new Uint8Array(data.transaction1.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const transaction1 = solanaWeb3.Transaction.from(tx1Buffer);
        const signedTx1 = await window.solana.signTransaction(transaction1);
        const signature1 = await connection.sendRawTransaction(signedTx1.serialize());
        console.log('[Mint] Transaction 1 Signature:', signature1);

        const tx1Confirmation = await connection.confirmTransaction({
            signature: signature1,
            blockhash: transaction1.recentBlockhash,
            lastValidBlockHeight: (await connection.getBlockHeight()) + 150
        }, { commitment: 'confirmed', maxRetries: 10 });
        if (tx1Confirmation.value.err) throw new Error('Tx1 failed: ' + JSON.stringify(tx1Confirmation.value.err));
        console.log('[Mint] Tx1 Confirmed');

        console.log('[Mint] Signing Tx2 with Phantom...');
        if (!data.transaction2) throw new Error('Transaction2 missing from server response!');
        const tx2Buffer = new Uint8Array(data.transaction2.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const transaction2 = solanaWeb3.Transaction.from(tx2Buffer);
        const signedTx2 = await window.solana.signTransaction(transaction2);
        const signature2 = await connection.sendRawTransaction(signedTx2.serialize());
        console.log('[Mint] Transaction 2 Signature:', signature2);

        const tx2Confirmation = await connection.confirmTransaction({
            signature: signature2,
            blockhash: transaction2.recentBlockhash,
            lastValidBlockHeight: (await connection.getBlockHeight()) + 150
        }, { commitment: 'confirmed', maxRetries: 10 });
        if (tx2Confirmation.value.err) throw new Error('Tx2 failed: ' + JSON.stringify(tx2Confirmation.value.err));
        console.log('[Mint] Tx2 Confirmed');

        mintingPoints = bigInt(mintingPoints || 0).add(25);
        lemonadePoints = bigInt(lemonadePoints || 0).add(25);
        updatePointsDisplay();

        await updateNFTDisplay('nft-info');
        await updateQuestProgressClient('launch-party', 'limited', 1);
        alert('NFT minted successfully with metadata! Check your Phantom wallet.');
    } catch (error) {
        console.error('[Mint] Error:', error);
        console.log('[Mint] Logs:', error.logs || []);
        alert('Failed to mint NFT: ' + error.message);
    } finally {
        button.classList.remove('loading');
    }
}
async function stakeNFT(mintAddress) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to stake!');
        return;
    }
    const response = await fetch(`/stake/${loggedInUsername}/${mintAddress}`, {
        method: 'POST',
        credentials: 'include'
    });
    const result = await response.json();
    if (response.ok && result.success) {
        await updateProfileDisplay();
        await updateNFTDisplay('nft-info');
        alert('NFT staked successfully!');
    } else {
        alert(result.error || 'Failed to stake NFT');
    }
}
        async function unstakeNFT(mintAddress) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to unstake!');
        return;
    }
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
}

async function evolveNFT(mintAddress, button) {
    if (!loggedInUsername || !walletAddress) {
        alert('Please login and connect wallet to evolve!');
        return;
    }
    if (!lemonadePoints || lemonadePoints.lt(10)) {
        alert('Need 10 Lemonade Points to evolve!');
        return;
    }

    const points = bigInt(lemonadePoints || 0);
    if (points.lt(10)) {
        alert('Need 10 Lemonade Points to evolve!');
        return;
    }
    button.classList.add('loading');
    try {
        const response = await fetch(`/evolve/${loggedInUsername}/${mintAddress}`, {
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
        button.classList.remove('loading');
    }
}

       
        async function trackPost() {
            if (!loggedInUsername) return;
            await updateQuestProgressClient('citrus-explorer', 'daily', 1);
            await updateQuestProgressClient('lemon-bard', 'weekly', 1);
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
    if (walletAddress) {
        disconnectWallet();
    } else if ('solana' in window) {
        console.log('Solana object found:', window.solana);
        const provider = window.solana;
        try {
            // Force connect even if isConnected is true, to ensure we get the public key
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

async function loadProducts() {
    const response = await fetch(`/printify-products`, { // Fixed URL syntax
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    if (response.ok && data.success && data.data.length > 0) {
        let html = '';
        data.data.forEach(product => {
            html += `<div class="nft-card"><img id="product-img-${product.id}" alt="${product.title}" style="max-width: 200px;"><p>${product.title} - $${product.variants[0].price / 100}</p><button onclick="buyMerch('${product.id}', ${product.variants[0].price / 100})">Buy with Crypto</button></div>`;
        });
        document.getElementById('product-list').innerHTML = html;

        data.data.forEach(product => {
            const img = document.getElementById(`product-img-${product.id}`);
            if (product.images && product.images[0] && product.images[0].src) {
                img.src = product.images[0].src;
            } else {
                img.src = 'https://via.placeholder.com/200';
            }
        });
    } else {
        document.getElementById('product-list').innerHTML = `<p>${data.message || 'No products available yet'}</p>`;
    }
}

        async function buyMerch(productId, price) {
    if (!walletAddress) {
        alert('Connect Solana wallet to buy!');
        return;
    }
    const address = prompt('Enter shipping address (name, street, city, state, zip, country):');
    if (!address) return;
    const chargeResponse = await fetch(`/create-charge`, { // Fixed URL syntax
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUsername, amount: price }),
        credentials: 'include'
    });
    const chargeResult = await chargeResponse.json();
    if (chargeResponse.ok && chargeResult.success) {
        window.open(chargeResult.chargeUrl, '_blank');
        const orderResponse = await fetch(`/printify-order`, { // Fixed URL syntax
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loggedInUsername, productId, address }),
            credentials: 'include'
        });
        const orderResult = await orderResponse.json();
        if (orderResult.success) alert('Order placed! ID: ' + orderResult.orderId);
    } else {
        alert(chargeResult.error || 'Failed to create charge');
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
    const response = await fetch(`/submit-ticket`, { // Fixed URL syntax
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
        credentials: 'include'
    });
    const result = await response.json();
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

