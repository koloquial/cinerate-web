import clientPromise from '@/lib/mongo';

export async function POST(req) {
  try {
    const { username } = await req.json();

    if (!username) {
      return new Response(JSON.stringify({ error: 'Missing username' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection('users');

    const exists = await users.findOne({
      username: { $regex: `^${username}$`, $options: 'i' }  // case-insensitive exact match
    });

    return new Response(JSON.stringify({ available: !exists }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
