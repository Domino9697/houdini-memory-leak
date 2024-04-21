import { load_Info } from '$houdini'
import { get } from 'svelte/store'

export async function load(event) {
	const id = parseInt(event.params.id)

	const { Info } = await load_Info({
		event,
		variables: {
			id
		}
	})

	// Avoid memory leak
	get(Info)

	return {
		Info
	}
}
