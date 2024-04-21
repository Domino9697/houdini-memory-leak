// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let id = 0
;(async () => {
	while (true) {
		try {
			const response = await fetch(`http://localhost:3000/${id}`, {
				signal: AbortSignal.timeout(10000)
			})
		} catch (error) {
			console.error(error)
		}

		// Wait for 1 second before the next iteration
		await delay(20)
		id++
	}
})()
