<script>
	/* @type { import('./$houdini').PageData } */
	export let data

	$: ({ Info } = data)

</script>

<div>{$Info.data.species.name}</div>
