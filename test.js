import { appendFileSync } from 'fs'

// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

;(async () => {
	while (true) {
		try {
			const response = await fetch('http://localhost:3000', {
				signal: AbortSignal.timeout(10000)
			})
		} catch (error) {
			console.error(error)
		}

		// Wait for 1 second before the next iteration
		await delay(20)
	}
})()
