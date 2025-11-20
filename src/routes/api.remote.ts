import { form, query } from '$app/server';
import * as argon2 from 'argon2';
import crypto from 'node:crypto';
import { db } from '$lib/db';

export const getKeys = query(async () => {
	const keys = db.keys;
	return keys;
});

export const getApiKey = form(async () => {
	const id = crypto.randomUUID();
	const LENGTH = 256;
	const secret = crypto.generateKeySync('hmac', { length: LENGTH }).export().toString('base64url');
	console.log({ secret });
	const hash = await argon2.hash(secret);
	const key = Buffer.from(`${id}.${secret}`).toString('base64url');
	db.create({ id, hash });
	return key;
});
