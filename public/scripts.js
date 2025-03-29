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

// Ensure showContent is called on page load for a default section
window.onload = function() {
    showContent('what-is-lcc');
};