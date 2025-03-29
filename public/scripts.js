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

 function updateRegisterButton() {
            const tosChecked = document.getElementById('regTos').checked;
            const riskChecked = document.getElementById('regRisk').checked;
            document.getElementById('registerBtn').disabled = !(tosChecked && riskChecked);
        }

function updateAuthButton() {
            document.getElementById('auth-btn').textContent = loggedInUsername ? 'Logout' : 'Login';
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
        const response = await fetch(`/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok && result.success) {
            loggedInUsername = username.toLowerCase();
            loggedInProfilePic = result.profilePic || 'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP1.png';
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
    const email = document.getElementById('registerEmail').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const emailConsent = document.getElementById('emailConsent').checked;
    console.log('[Register] Email:', email, 'Username:', username, 'Password:', password, 'Email Consent:', emailConsent);
    if (!email || !username || !password) {
        alert('Please enter email, username, and password!');
        return;
    }
    try {
        const response = await fetch(`/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, emailConsent })
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