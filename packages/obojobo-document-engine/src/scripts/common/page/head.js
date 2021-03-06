let addEl = function(url, el, onLoad, onError) {
	if (onLoad == null) {
		onLoad = null
	}
	if (onError == null) {
		onError = null
	}
	if (loaded[url]) {
		if (onLoad != null) {
			onLoad(url)
		}
		return true // return true, meaning the file was loaded
	}

	if (onError != null) {
		el.onerror = onError
	}
	if (onLoad != null) {
		el.onload = function() {
			loaded[url] = url
			return onLoad(url)
		}
	}

	document.head.appendChild(el)

	return false // return false, meaning the file wasn't already loaded
}

var loaded = {}

export default {
	add(urlOrUrls, onLoad, onError) {
		let urls
		let type
		if (onLoad == null) {
			onLoad = null
		}
		if (onError == null) {
			onError = null
		}
		console.log('add', arguments)

		if (typeof urlOrUrls === 'string') {
			urls = [urlOrUrls]
		} else {
			urls = urlOrUrls
		}

		return Array.from(urls).map(
			url => (
				(type = url.substr(url.lastIndexOf('.') + 1)),
				console.log(type),
				(() => {
					switch (type) {
						case 'js':
							let script = document.createElement('script')
							script.setAttribute('src', url)
							return addEl(url, script, onLoad, onError)

						case 'css':
							let link = document.createElement('link')
							link.setAttribute('rel', 'stylesheet')
							link.setAttribute('href', url)
							return addEl(url, link, onLoad, onError)
					}
				})()
			)
		)
	}
}
