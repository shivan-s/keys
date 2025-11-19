import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as z from 'zod';
import * as jose from 'jose';
import { db } from '$lib/db';
import { sign } from '$lib/auth';

const RequestHeaderSchema = z.object({
	'x-auth': z.string()
});

const SchemaPayload = z.object({ id: z.uuid(), name: z.string() });

export const GET: RequestHandler = async ({ request }) => {
	const result = RequestHeaderSchema.safeParse(Object.fromEntries(request.headers.entries()));
	if (result.success === false) {
		console.info(result.error);
		error(401);
	}
	const jwt = result.data['x-auth'];
	try {
		const { payload } = await jose.jwtVerify(jwt, sign);
		const result = SchemaPayload.safeParse(payload);
		if (result.success === false) {
			console.info('Invalid payload');
			error(401);
		}
		const user = result.data;
		const record = db.find(user.id);
		if (record === undefined) {
			console.info('Record not found');
			error(401);
		}
		return json(user, { status: 200 });
	} catch (err) {
		console.info(err);
		error(401);
	}
};
