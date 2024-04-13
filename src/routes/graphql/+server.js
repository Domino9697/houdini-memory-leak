import { json } from '@sveltejs/kit'
import { schema } from './schema'
import * as graphql from 'graphql'

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { query, variables } = await request.json()

	// set cors for testing
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST',
		'Access-Control-Allow-Headers': 'Content-Type'
	}

	return json(
		await graphql.execute({
			schema,
			document: graphql.parse(query),
			variableValues: variables
		}),
		{
			headers
		}
	)
}
