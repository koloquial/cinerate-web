import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';
import admin from '@/lib/firebase-admin';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split('Bearer ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const user = await db.collection('users').findOne({ uid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { username, email, uid: userId } = user;
    return NextResponse.json({ username, email, uid: userId });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}
