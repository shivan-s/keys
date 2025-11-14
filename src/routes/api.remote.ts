import { form, query } from '$app/server';
import * as argon2 from 'argon2';
import { db } from '$lib/db';

export const getKeys = query(async () => {
	const keys = db.keys;
	return keys;
});

export const getApiKey = form(async () => {
	const id = crypto.randomUUID();
	const secret = crypto.randomUUID();
	const hash = await argon2.hash(secret);
	const key = Buffer.from(JSON.stringify({ id, secret })).toString('base64url');
	db.create({ id, hash });
	return key;
});
