import clientPromise from '@/lib/mongo';

export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, email, provider, username } = body;

    console.log('[save-user] Body:', body);

    if (!uid || !email || !username) {
      console.error('[save-user] Missing uid, email, or username');
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection('users');

    // Prevent duplicate usernames
    const existing = await users.findOne({ username });
    if (existing) {
      console.warn('[save-user] Username taken:', username);
      return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 });
    }

    const result = await users.insertOne({
      uid,
      email,
      provider,
      username,
      createdAt: new Date()
    });

    console.log('[save-user] User inserted:', result.insertedId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('[save-user] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
