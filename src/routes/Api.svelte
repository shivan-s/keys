<script lang="ts">
	import { getApiKey, getKeys } from './api.remote';
</script>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>ID</th>
			<th>Hash</th>
		</tr>
	</thead>
	<tbody>
		{#each await getKeys() as { name, id, hash } (id)}
			<tr>
				<td>{name}</td>
				<td>{id}</td>
				<td>{hash}</td>
			</tr>
		{/each}
	</tbody>
</table>

<form {...getApiKey}>
	<button disabled={!!getApiKey.result} type="submit" name="submit">Create Key</button>
</form>

{#if getApiKey.result}
	<p><strong>Secret:</strong> {getApiKey.result}</p>
{/if}
