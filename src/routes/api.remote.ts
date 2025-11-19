import { form, query } from '$app/server';
import * as jose from 'jose';
import * as argon2 from 'argon2';
import { db } from '$lib/db';

export const getKeys = query(async () => {
	const keys = db.keys;
	return keys;
});

async function generateSecret(): Promise<string> {
	const preSecret = await jose.generateSecret('HS256', { extractable: true });
	const jwk = await jose.exportJWK(preSecret);
	if (jwk.kty !== 'oct' && jwk.k === undefined) {
		console.error({ jwk });
		throw Error('Please check generated key');
	}
	const key = jwk.k;
	if (key === undefined) throw Error('`k` is not defined');
	console.log({ key });
	const secret = Buffer.from(key).toString('base64url');
	console.log({ secret });
	return secret;
}

export const getApiKey = form(async () => {
	const id = crypto.randomUUID();
	const secret = await generateSecret();
	const hash = await argon2.hash(secret);
	const key = Buffer.from(`${id}.${secret}`).toString('base64url');
	db.create({ id, hash });
	return key;
});
