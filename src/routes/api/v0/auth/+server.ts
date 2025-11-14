import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as z from 'zod';
import * as jose from 'jose';
import { db } from '$lib/db';

const Schema = z.object({
	secret: z
		.base64url()
		.transform((data) => Buffer.from(data, 'base64url').toString('ascii'))
		.pipe(z.string())
		.transform((data, ctx) => {
			try {
				return JSON.parse(data);
			} catch (err) {
				console.info(err);
				ctx.issues.push({ code: 'custom', input: data });
			}
		})
		.transform((data) => JSON.parse(data))
		.pipe(z.object({ id: z.uuid(), secret: z.base64url() }))
});

export const POST: RequestHandler = async ({ request }) => {
	const fd = await request.formData();
	const result = Schema.safeParse({ secret: fd.get('secret') });
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
	if (await .verify(record.hash, secret)) {
		const payload = new TextEncoder().encode(JSON.stringify({ name: record.name }));
		const alg = 'HS256';
		const token = await new jose.SignJWT()
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setExpirationTime('5min')
			.sign(payload);
		return json({ token }, { status: 200 });
	}
	error(401);
};
