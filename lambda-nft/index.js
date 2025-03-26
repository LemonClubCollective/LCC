const { createCanvas } = require('canvas');
const axios = require('axios');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: 'us-east-1' });

const nftLayers = {
  backgrounds: [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGsunset.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGsunsetforest1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGstars.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGstars1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGnightforest.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGnightforest1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgreengrass.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgrassfield.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgrassfieldswirl.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGforestsunset.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGanimesunset.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGcloudsevening.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGforestgrass.png'
  ],
  seed: [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/brownseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/goldseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/greenseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/raregoldseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rareredseed.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rareredseed2.png'
  ],
  sprout: [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/greensprout.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/greensprout2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/magicsprout.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/magicsprout1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/purplesprout1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/purplesprout2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/redrubysprout.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/redrubysprout2.png'
  ],
  sapling: [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/greensapling.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling3.png'
  ],
  tree: [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/diamondtree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/emeraldtree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldentree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldentree3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldtree1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldtree2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/lemontree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree2.png'
  ]
};

function getRandomItem(array, rarityRules = null) {
  if (!array || array.length === 0) throw new Error('No items available in array for random selection');
  if (rarityRules) {
    const totalWeight = Object.values(rarityRules).reduce((sum, weight) => sum + weight, 0);
    const rand = Math.random() * totalWeight;
    let weightSum = 0;
    for (const [color, weight] of Object.entries(rarityRules)) {
      weightSum += weight;
      if (rand <= weightSum) {
        const filtered = array.filter(item => item.includes(color));
        return filtered[Math.floor(Math.random() * filtered.length)] || array[Math.floor(Math.random() * array.length)];
      }
    }
  }
  return array[Math.floor(Math.random() * array.length)];
}

exports.handler = async (event) => {
  const { stageName = 'Lemon Seed', tokenId } = event;
  const rarityRules = event.rarityRules || { 'diamond': 0.2, 'red': 0.4, 'purple': 0.5 };

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  const stageMap = { 'Lemon Seed': 'seed', 'Lemon Sprout': 'sprout', 'Lemon Sapling': 'sapling', 'Lemon Tree': 'tree' };
  const stageKey = stageMap[stageName] || 'seed';

  ctx.clearRect(0, 0, 512, 512);

  const backgroundPath = getRandomItem(nftLayers.backgrounds);
  let background;
  try {
    const backgroundResponse = await axios.get(backgroundPath, { responseType: 'arraybuffer' });
    background = await require('canvas').loadImage(Buffer.from(backgroundResponse.data));
  } catch (error) {
    throw new Error('Background fetch failed: ' + error.message);
  }
  ctx.drawImage(background, 0, 0, 512, 512);

  const baseImages = nftLayers[stageKey];
  let baseImage, baseImagePath;
  for (let i = 0; i < baseImages.length; i++) {
    baseImagePath = getRandomItem(baseImages, rarityRules);
    try {
      const baseImageResponse = await axios.get(baseImagePath, { responseType: 'arraybuffer' });
      baseImage = await require('canvas').loadImage(Buffer.from(baseImageResponse.data));
      break;
    } catch (error) {
      if (i === baseImages.length - 1) throw new Error('No valid base image found');
    }
  }
  ctx.drawImage(baseImage, 0, 0, 512, 512);

  const imageBuffer = canvas.toBuffer('image/png');
  const imageKey = `usernft/nft_${tokenId}.png`;
  await s3Client.send(new PutObjectCommand({
    Bucket: 'lemonclub-nftgen',
    Key: imageKey,
    Body: imageBuffer,
    ContentType: 'image/png'
  }));
  const imageUrl = `https://drahmlrfgetmm.cloudfront.net/${imageKey}`;

  const rarity = baseImagePath.includes('diamond') ? 'Diamond' :
                baseImagePath.includes('red') ? 'Ruby' :
                baseImagePath.includes('purple') ? 'Amethyst' : 'Common';
  const metadata = {
    name: `${stageName} #${tokenId}`,
    symbol: stageKey === 'seed' ? 'LSEED' : stageKey === 'sprout' ? 'LSPRT' : stageKey === 'sapling' ? 'LSAPL' : 'LTREE',
    description: `A unique Lemon Club NFT at the ${stageName} stage with ${rarity} rarity`,
    image: imageUrl,
    attributes: [
      { trait_type: 'Stage', value: stageName.split(' ')[1] },
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Background', value: backgroundPath.split('/').pop().replace('.png', '') },
      { trait_type: 'Base', value: baseImagePath.split('/').pop().replace('.png', '') }
    ],
    seller_fee_basis_points: 500,
    collection: { name: 'Lemon Club Collective', family: 'LCC' },
    properties: { files: [{ uri: imageUrl, type: 'image/png' }], category: 'image', creators: [] }
  };
  const metadataKey = `usernft/nft_${tokenId}.json`;
  await s3Client.send(new PutObjectCommand({
    Bucket: 'lemonclub-nftgen',
    Key: metadataKey,
    Body: JSON.stringify(metadata, null, 2),
    ContentType: 'application/json'
  }));
  const metadataUrl = `https://drahmlrfgetmm.cloudfront.net/${metadataKey}`;

  return { statusCode: 200, body: JSON.stringify({ imageUrl, metadataUrl }) };
};