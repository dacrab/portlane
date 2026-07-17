export async function downloadFile(path: string, name: string) {
	const res = await fetch(`/api/file-url?path=${encodeURIComponent(path)}`)
	if (!res.ok) throw new Error('Download failed')
	const { url } = await res.json()
	const a = document.createElement('a')
	a.href = url
	a.download = name
	a.click()
}
