import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as argon2 from 'argon2';
import * as z from 'zod';
import * as jose from 'jose';
import { db } from '$lib/db';

const Schema = z.object({
	secret: z
		.base64url()
		.transform((data) => Buffer.from(data, 'base64').toString('ascii'))
		.pipe(z.string())
		.transform((data, ctx) => {
			try {
				return JSON.parse(data);
			} catch (err) {
				console.info(err);
				ctx.issues.push({ code: 'custom', input: data });
			}
		})
		.pipe(z.object({ id: z.uuid(), secret: z.uuid() }))
});

export const POST: RequestHandler = async ({ request }) => {
	const fd = await request.formData();
	const k = 'secret';
	const result = Schema.safeParse({ [k]: fd.get(k) });
	if (result.success === false) {
		console.info(result.error);
		error(401);
	}
	const { secret, id } = result.data.secret;
	const record = db.find(id);
	if (record === undefined) {
		console.info('Record not found');
		error(401);
	}
	if (await argon2.verify(record.hash, secret)) {
		const secret = new TextEncoder().encode('abcd');
		const payload = { name: record.name };
		const alg = 'HS256';
		const token = await new jose.SignJWT(payload)
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setExpirationTime('5min')
			.sign(secret);
		return json({ token }, { status: 200 });
	}
	console.info('Invalid Key');
	error(401);
};
