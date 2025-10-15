require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function findWoningen() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment');
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("main-db");

    // Find all woningen with "Teststraat" or "teststraat" in the address
    const woningen = await db.collection('woningen')
      .find({
        "projectInformation.adres": { $regex: /teststraat/i }
      })
      .toArray();

    console.log('Found woningen:', JSON.stringify(woningen, null, 2));

  } finally {
    await client.close();
  }
}

findWoningen().catch(console.error);
