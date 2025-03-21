// app.js
async function getProvider() {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            try {
                await provider.connect();
                console.log("Connected to Phantom wallet!");
                return provider;
            } catch (err) {
                throw new Error("Couldn’t connect to Phantom—please make sure it’s unlocked!");
            }
        } else {
            throw new Error("Phantom wallet not detected—please install it!");
        }
    } else {
        throw new Error("No Solana wallet found—please install Phantom!");
    }
}

async function mintNFT(button, username) {
    try {
        console.log("Starting mintNFT...");
        const provider = await getProvider();
        const wallet = provider.publicKey.toString();
        console.log("Connected to Phantom:", wallet);

        button.classList.add('loading');
        const response = await fetch(`http://localhost:3000/mint/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Something went wrong minting your NFT!");
        }

        console.log("Mint successful:", result);
        alert(`NFT minted successfully! Mint Address: ${result.mintAddress}`);
        return result;
    } catch (error) {
        console.error("Error in mintNFT:", error.message);
        alert(`Oops! ${error.message} Try refreshing or checking your wallet.`);
        throw error;
    } finally {
        button.classList.remove('loading');
    }
}