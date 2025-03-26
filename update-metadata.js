const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function updateMetadata() {
    try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const wallet = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(fs.readFileSync('C:\\Users\\public.DESKTOP-1IFDKN4\\solana\\dev-wallet.json')))
        );
        const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

        const mintAddress = new PublicKey('awJXYqh4yPCDKFgMdBu1CfFEP754KpYnR1YDeyLcHRm');
        const nft = await metaplex.nfts().findByMint({ mintAddress });

        console.log('Fetched NFT:', JSON.stringify(nft, null, 2));

        const { response } = await metaplex.nfts().update({
            nftOrSft: nft,
            uri: 'https://api.jsonbin.io/v3/b/67b8fc93acd3cb34a8eba2a1',
            name: 'Lemon Seed',
            symbol: 'LSEED',
            sellerFeeBasisPoints: 500,
            creators: [{ address: wallet.publicKey, share: 100 }],
            authority: wallet,
        }, { commitment: 'confirmed' });

        console.log('Metadata reset to Seed! Signature:', response.signature);
        console.log('Metadata Address:', nft.metadataAddress.toString());
    } catch (error) {
        console.error('Error updating metadata:', error);
    }
}

updateMetadata();