const { MongoClient, ServerApiVersion } = require('mongodb');

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    res.status(500).json({ success: false, error: 'MONGODB_URI environment variable is missing' });
    return;
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // short socket timeouts so the function returns quickly on network issues
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    await client.close();
    res.status(200).json({ success: true, message: 'Successfully connected and pinged MongoDB Atlas' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
