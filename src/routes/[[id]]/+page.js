import { load_Info } from '$houdini'
import { error } from '@sveltejs/kit'

export async function load(event) {
	const { Info } = await load_Info({
		event,
		variables: {
			id: 2
		}
	})

	// This throws a 500 error and breaks the flow
	error(500)

	return {
		Info
	}
}
