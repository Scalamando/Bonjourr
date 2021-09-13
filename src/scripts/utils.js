const id = (name) => document.getElementById(name)
const cl = (name) => document.getElementsByClassName(name)
const has = (dom, val) => {
	if (dom && dom.classList) if (dom.classList.length > 0) return dom.classList.contains(val)
	return false
}

const clas = (dom, add, str) => {
	if (add) dom.classList.add(str)
	else dom.classList.remove(str)
}

let lazyClockInterval = setTimeout(() => {}, 0),
	googleFontList = {},
	stillActive = false,
	rangeActive = false,
	firstpaint = false,
	sunset = 0,
	sunrise = 0

const domshowsettings = id('showSettings'),
	domlinkblocks = id('linkblocks_inner'),
	domoverlay = id('background_overlay'),
	dominterface = id('interface'),
	domsearchbar = id('searchbar'),
	domimg = id('background'),
	domthumbnail = cl('thumbnail'),
	domclock = id('clock'),
	domcredit = id('credit')

let mobilecheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
if (navigator.userAgentData) mobilecheck = navigator.userAgentData.mobile

const isExtension = window.location.protocol === 'chrome-extension:' || window.location.protocol === 'moz-extension:',
	loadtimeStart = performance.now(),
	BonjourrAnimTime = 400,
	version = '1.10.0',
	browser = 'chrome',
	funcsOk = {
		clock: false,
		links: false,
	}

const stringMaxSize = (string, size) => (string.length > size ? string.slice(0, size) : string)
const minutator = (date) => date.getHours() * 60 + date.getMinutes()

const saveIconAsAlias = (iconstr) => {
	const alias = 'alias:' + Math.random().toString(26).substring(2)
	const tosave = {}
	tosave[alias] = iconstr
	chrome.storage.local.set(tosave)
	return alias
}

// lsOnlineStorage works exactly like chrome.storage
// Just need to replace every chrome.storage
// And maybe change import option

const lsOnlineStorage = {
	get: (local, unused, callback) => {
		const key = local ? 'bonjourrBackgrounds' : 'bonjourr'
		const data = localStorage[key] ? JSON.parse(localStorage[key]) : {}
		callback(data)
	},
	set: (prop, callback) => {
		lsOnlineStorage.get(null, null, (data) => {
			if (typeof prop === 'object') {
				const [key, val] = Object.entries(prop)[0]

				if (key === 'import') data = val
				else data[key] = val

				localStorage.bonjourr = JSON.stringify(data)
				if (callback) callback
			}
		})
	},

	setLocal: (prop) => {
		lsOnlineStorage.get(true, null, (data) => {
			if (typeof prop === 'object') {
				data = {
					...data,
					...prop,
				}
				localStorage.bonjourrBackgrounds = JSON.stringify(data)
			}
		})
	},
	remove: (isLocal, key) => {
		lsOnlineStorage.get(isLocal, null, (data) => {
			delete data[key]
			if (isLocal) localStorage.bonjourrBackgrounds = JSON.stringify(data)
			else localStorage.bonjourr = JSON.stringify(data)
		})
	},
	log: (isLocal) => lsOnlineStorage.get(isLocal, null, (data) => console.log(data)),
	del: () => localStorage.clear(),
}

const logsync = (flat) => chrome.storage.sync.get(null, (data) => consolr(flat, data))
const loglocal = (flat) => chrome.storage.local.get(null, (data) => consolr(flat, data))

function deleteBrowserStorage() {
	if (isExtension) {
		chrome.storage.sync.clear()
		chrome.storage.local.clear()
	}
	localStorage.clear()
}

function consolr(flat, data) {
	if (flat) console.log(data)
	else Object.entries(data).forEach((elem) => console.log(elem[0], elem[1]))
}

const testOS = {
	mac: () => window.navigator.appVersion.includes('Macintosh'),
	windows: () => window.navigator.appVersion.includes('Windows'),
	android: () => window.navigator.userAgent.includes('Android'),
	ios: () =>
		['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
		(navigator.userAgent.includes('Mac') && 'ontouchend' in document),
}

function bonjourrDefaults(which) {
	switch (which) {
		case 'sync':
			return {
				usdate: false,
				showall: false,
				linksrow: 6,
				cssHeight: 80,
				reviewPopup: 0,
				background_blur: 15,
				background_bright: 0.8,
				css: '',
				lang: 'en',
				greeting: '',
				background_type: 'dynamic',
				links: [],
				clock: {
					ampm: false,
					analog: false,
					seconds: false,
					face: 'none',
					timezone: 'auto',
				},
				dynamic: {
					every: 'hour',
					collection: '',
					lastCollec: '',
					time: Date.now(),
				},
				weather: {
					ccode: 'FR',
					city: 'Paris',
					unit: 'metric',
					location: [],
				},
				searchbar: {
					on: false,
					newtab: false,
					engine: 'google',
					request: '',
				},
				font: {
					url: '',
					family: '',
					weight: '400',
					availWeights: [],
					size: mobilecheck ? '11' : '14',
				},
				hide: [[0, 0], [0, 0, 0], [0], [0]],
				about: { browser, version },
			}

		case 'local':
			return {
				custom: [],
				customThumbnails: [],
				dynamicCache: {
					noon: [],
					day: [],
					evening: [],
					night: [],
					user: [],
				},
			}
	}
}