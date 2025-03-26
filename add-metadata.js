const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function addMetadata() {
    try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const wallet = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(fs.readFileSync('C:\\Users\\public.DESKTOP-1IFDKN4\\solana\\dev-wallet.json')))
        );
        const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

        const mintAddress = new PublicKey('AXZZ8p96MMbhdp6uHiami7yNk5VkM6ZRACMsuibXw1H4');
        const tokenOwner = wallet.publicKey;

        const { nft, response } = await metaplex.nfts().create({
            uri: 'https://api.jsonbin.io/v3/b/67b8fc93acd3cb34a8eba2a1',
            name: 'Lemon Seed',
            symbol: 'LSEED',
            sellerFeeBasisPoints: 500,
            creators: [{ address: wallet.publicKey, share: 100 }],
            tokenOwner: tokenOwner,
            mintAddress: mintAddress,
            isMutable: true,
        });

        console.log('Metadata created! Signature:', response.signature);
        console.log('Metadata Address:', nft.metadataAddress.toString());
    } catch (error) {
        console.error('Error creating metadata:', error);
    }
}

addMetadata();