import { faker } from '@faker-js/faker';

class DB {
	keys: {
		name: string;
		id: string;
		hash: string;
	}[] = [];

	create(params: { hash: string; id: string }) {
		this.keys.push({
			name: faker.person.fullName(),
			id: params.id,
			hash: params.hash
		});
	}

	find(id: string) {
		const key = this.keys.find((k) => k.id === id);
		return key;
	}
}

export const db = new DB();
