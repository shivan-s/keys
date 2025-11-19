import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as argon2 from 'argon2';
import * as z from 'zod';
import * as jose from 'jose';
import { db } from '$lib/db';
import { sign } from '$lib/auth';

const Schema = z.strictObject({
	secret: z
		.base64url()
		.transform((data) => Buffer.from(data, 'base64').toString('ascii'))
		.pipe(z.string())
		.transform((data) => data.split('.'))
		.pipe(z.tuple([z.uuid(), z.base64url()]))
});

export const POST: RequestHandler = async ({ request }) => {
	const fd = await request.formData();
	const result = Schema.safeParse(Object.fromEntries(fd.entries()));
	if (result.success === false) {
		console.info(result.error);
		error(401);
	}
	const [id, secret] = result.data.secret;
	const record = db.find(id);
	if (record === undefined) {
		console.info('Record not found');
		error(401);
	}
	if (await argon2.verify(record.hash, secret)) {
		const payload = { id: id, name: record.name };
		const alg = 'HS256';
		const token = await new jose.SignJWT(payload)
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setExpirationTime('60min')
			.sign(sign);
		return json({ token }, { status: 200 });
	}
	console.info('Invalid Key');
	error(401);
};
