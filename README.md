# Minimal reproduction of a Houdini memory issue

## Description

We are currently facing an issue where the memory consumption of our docker containers are increasing over time. After some investigation, I can say the issue is coming from the Houdini library.
From what I can see, Houdini stores are not removed from memory if an error is thrown right after a fetch call or if the fetch call itself throws an error.

For example (from the pokedex intro):

```js
export async function load(event) {
    const { Info } = await load_Info({
        event,
        variables: {
            id: 2
        })

    // This throws an error
    error(500)

    return {
        Info
    }
}
```

## Steps to reproduce

1. Clone the project
2. Run `pnpm install`
3. Run `pnpm run build`

5. In a separate terminal, run `node --inspect build/index.js` to run the application in production mode with the inspector enabled.

6. In a separate terminal, run the test script `node test.js`. This script will spam the server with requests so don't keep it running for too long.

7. Observe the memory usage with snapshots in Chrome DevTools via chrome://inspect and then look for the node process. Take heap snapshots every now and then.

8. Observe the memory usage increase over time and search for `Store` in the search panel of the heap snapshot.

## Expected result

The memory usage should not increase over time.
The number of houdini document stores should not increase over time and should be limited to just the current active stores when the snaphsot was taken.

## Actual result

The memory usage increases over time.
The number of houdini document stores increases over time. I could get thousands of stores in a few minutes.

## Investigation comments

When looking at why this is happening, I saw that an active subscription is kept in memory if an error is thrown after calling fetch. I looked at the Houdini source code and found that the issue is coming from [here](https://github.com/HoudiniGraphql/houdini/blob/71ec48593c828696342c30afb8cf430a5c5dec56/packages/houdini-svelte/src/runtime/stores/base.ts#L119).
When we call fetch, we call the BaseStore setup function which subscribed to an observer... And I see that we do unsubscribe from this when a unsubscribe call is made to the Houdini store. However, this might never happen especially in the scenario mentioned above.

This is not an issue in the nominal path because the library expects users to return the store in svelte components and then subscribe to it. However, if the fetch itself throws or if a throw happens after calling fetch, the store is not subscribed to and unsubscribe is not called.

To verify this, we can add a `get` call right after fetch is called and look at the results.

```js
export async function load(event) {
	const { Info } = await load_Info({
		event,
		variables: {
			id: 2
		}
	})

	get(Info)

    // This throws an error
	error(500)

	return {
		Info
	}
}
```

By doing this, we don't see the leak anymore.

## Fix for now

On our side we can add a `get` call right after the fetch call to avoid the memory leak. However, I think this should be fixed in the library itself as this could be a serious issue for a lot of users using manual loading or the throwOnError option.

Since we are getting these issues because we throw when a graphql error is returned, we could use the following hack for now:

```js
export async function load(event) {
    const Info = new InfoStore()
    await Info.fetch({
        event,
        variables: {
            id: 2
    }).catch((err) => {
        get(Info)

        throw err
    })


    return {
        Info
    }
}
```

I have no idea if this would break some functionalities but after some testing, it seems to work fine.
