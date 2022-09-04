import { writable } from 'svelte/store'
import { browser } from "$app/environment";

const stored = browser ? localStorage.schedule_data : undefined
export const schedule_data = writable(stored || JSON.stringify({
    size_info: {
        height: 800,
        padding_top: 50,
        padding_left: 32,
        output_width: 1920,
        output_height: 1080
    },
    schedule: []
}))

if (browser) {
    schedule_data.subscribe((value) => localStorage.schedule_data = value)
}