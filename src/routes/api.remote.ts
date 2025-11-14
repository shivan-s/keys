import { form, query } from '$app/server';
import * as jose from 'jose';
import { db } from '$lib/db';
import { subtle } from 'node:crypto';

export const getKeys = query(async () => {
	const keys = db.keys;
	return keys;
});

export const getApiKey = form(async () => {
	const id = crypto.randomUUID();
	const alg = 'Ed25519';
	const pair = await jose.generateKeyPair(alg, { extractable: true });
	const [publicKey, privateKey] = await Promise.all([
		await subtle.exportKey('spki', pair.publicKey),
		await subtle.exportKey('pkcs8', pair.privateKey)
	]);
	console.log({ publicKey });
	const publicKeyAsBase64Url = Buffer.from(publicKey).toString('base64url');
	console.log(publicKeyAsBase64Url);

	console.log({ privateKey });
	const privateKeyAsBase64Url = Buffer.from(privateKey).toString('base64url');
	console.log(privateKeyAsBase64Url);
	const key = Buffer.from(JSON.stringify({ id, secret: privateKeyAsBase64Url })).toString(
		'base64url'
	);
	db.create({ id, hash: publicKeyAsBase64Url });
	return key;
});
