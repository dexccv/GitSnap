import { toPng, toJpeg } from 'html-to-image'
import confetti from 'canvas-confetti'
import { marked } from 'marked'

// DOM Elements
const repoUrlInput = document.getElementById('repo-url')
const generateBtn = document.getElementById('generate-btn')
const githubCard = document.getElementById('github-card')
const captureArea = document.getElementById('capture-area')
const downloadBtn = document.getElementById('download-btn')
const exportFormat = document.getElementById('export-format')
const sizePreset = document.getElementById('size-preset')
const themeButtons = document.querySelectorAll('.theme-btn')
const toggleReadme = document.getElementById('toggle-readme')
const toggleExplorer = document.getElementById('toggle-explorer')

// GitHub Token (hardcoded for higher rate limits)
const GITHUB_TOKEN = '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'

// Containers
const explorerSidebar = document.getElementById('explorer-sidebar')
const readmeContainer = document.getElementById('readme-container')

// Card Elements
const browserUrl = document.getElementById('browser-url')
const cardRepoFull = document.getElementById('card-repo-full')
const cardLang = document.getElementById('card-lang')
const cardLangColor = document.getElementById('card-lang-color')
const cardStars = document.getElementById('card-stars')
const cardForks = document.getElementById('card-forks')
const cardWatchers = document.getElementById('card-watchers')
const explorerList = document.getElementById('explorer-list')
const readmeRendered = document.getElementById('readme-rendered')

// Default Base64 SVGs to prevent 404 failures during capture
const FALLBACK_FILE_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC42KSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMyAyaDYgYTIgMiAwIDAgMSAyIDJ2MTYgYTIgMiAwIDAgMS0yIDJINDIgYTIgMiAwIDAgMS0yLTJWNGExIDEgMCAwIDEgMS0xaDkiLz48cGF0aCBkPSJNMTMgMnY0YTEgMSAwIDAgMCAxIDFoNCIvPjwvc3ZnPg=='
const FALLBACK_FOLDER_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDIyMCwxMDAsMC44KSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMiAxOXYtNGEyIDIgMCAwIDAtMi0yaC0xLjY4MmEuMi4yIDAgMCAxLS4xNjYtLjA5bC0xLjMyLTFrLTIuNjY2LTIuMDA5YS4yLjIgMCAwIDAtLjExLTAzNEg0YTIgMiAwIDAgMC0yIDJ2MTJhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yeiIvPjwvc3ZnPg=='

// Language color mapping
const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C++': '#f34b7d',
  Rust: '#dea584',
  Go: '#00ADD8',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Vue: '#41b883',
  React: '#61dafb'
}

// State
let isGenerating = false

// Set marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
})

const formatNum = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const fetchRepoData = async (owner, repo) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)

  if (response.status === 403) {
    const resetTime = response.headers.get('X-RateLimit-Reset')
    const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleTimeString() : 'unknown'
    throw new Error(`GitHub API rate limit exceeded. Try again after ${resetDate}. Tip: Use a GitHub Personal Access Token for higher limits.`)
  }

  if (response.status === 404) {
    throw new Error('Repository not found. Please check the URL and try again.')
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch repository: ${response.statusText}`)
  }

  return await response.json()
}
// Helper function to get fetch headers with authentication
const getHeaders = () => ({
  'Accept': 'application/vnd.github.v3+json',
  'Authorization': `token ${GITHUB_TOKEN}`
})

const fetchContents = async (owner, repo) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
    headers: getHeaders()
  })

  if (response.status === 403) {
    console.warn('Rate limit hit for contents, using empty array')
    return []
  }

  if (!response.ok) return []
  return await response.json()
}

const fetchReadme = async (owner, repo) => {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: getHeaders()
    })

    if (response.status === 403) {
      return '# Rate Limit Exceeded\nGitHub API rate limit reached. README preview unavailable.'
    }

    if (!response.ok) return '# No README.md\nThis repository does not have a README.'

    const data = await response.json()
    const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))))
    return content
  } catch (e) {
    return '# Error\nCould not fetch README content.'
  }
}

const getFileIcon = (name, type) => {
  const baseUrl = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/master/icons'

  if (type === 'dir') {
    const folderMap = {
      src: 'folder-src',
      public: 'folder-public',
      node_modules: 'folder-node',
      assets: 'folder-resource',
      scripts: 'folder-scripts',
      test: 'folder-test',
      tests: 'folder-test',
      dist: 'folder-dist',
      build: 'folder-dist',
      css: 'folder-css',
      style: 'folder-css',
      styles: 'folder-css',
      js: 'folder-javascript',
      javascript: 'folder-javascript',
      images: 'folder-images',
      img: 'folder-images',
      docs: 'folder-docs'
    }
    const folderName = folderMap[name.toLowerCase()] || 'folder'
    return `${baseUrl}/${folderName}.svg`
  }

  const ext = name.split('.').pop().toLowerCase()
  const iconMap = {
    js: 'javascript', ts: 'typescript', jsx: 'react', tsx: 'react_ts',
    css: 'css', html: 'html', json: 'json', md: 'markdown',
    py: 'python', java: 'java', rb: 'ruby', rs: 'rust',
    go: 'go', php: 'php', sql: 'database', sh: 'console',
    yml: 'yaml', yaml: 'yaml', dockerfile: 'docker',
    svg: 'svg', png: 'image', jpg: 'image', jpeg: 'image',
    gif: 'image', pdf: 'pdf', zip: 'zip', exe: 'exe',
    txt: 'document', gitignore: 'git'
  }

  const iconName = iconMap[ext]
  // If no icon mapping found, return fallback directly instead of trying to fetch file.svg
  if (!iconName) return FALLBACK_FILE_ICON

  return `${baseUrl}/${iconName}.svg`
}

const updateCard = async (owner, repo) => {
  try {
    const [details, contents, readme] = await Promise.all([
      fetchRepoData(owner, repo),
      fetchContents(owner, repo),
      fetchReadme(owner, repo)
    ])

    browserUrl.textContent = `github.com/${owner}/${repo}`
    cardRepoFull.innerHTML = `<span>${owner} /</span> ${repo}`
    cardStars.textContent = formatNum(details.stargazers_count)
    cardForks.textContent = formatNum(details.forks_count)
    cardWatchers.textContent = formatNum(details.watchers_count)

    const lang = details.language || 'Markdown'
    cardLang.textContent = lang
    cardLangColor.style.backgroundColor = langColors[lang] || '#8b949e'

    // Render Explorer
    explorerList.innerHTML = ''
    contents.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'dir' ? -1 : 1
    }).slice(0, 10).forEach(item => {
      const div = document.createElement('div')
      div.className = 'file-item'
      const iconUrl = getFileIcon(item.name, item.type)
      const fallback = item.type === 'dir' ? FALLBACK_FOLDER_ICON : FALLBACK_FILE_ICON

      const chevron = item.type === 'dir' ? '<span class="chevron">›</span>' : '<span class="chevron-spacer"></span>'
      // Use onerror to handle missing remote icons and avoid capture failures
      div.innerHTML = `${chevron} <img src="${iconUrl}" class="file-icon" crossorigin="anonymous" onerror="this.src='${fallback}'; this.onerror=null;" alt="icon"> ${item.name}`
      explorerList.appendChild(div)
    })

    // Render Markdown
    readmeRendered.innerHTML = marked.parse(readme)

    return details // Return details for stats population

  } catch (error) {
    alert('Error: ' + error.message)
    throw error // Re-throw to handle in caller
  }
}

const updateSize = () => {
  const preset = sizePreset.value
  let width, height, layoutClass

  githubCard.classList.remove('layout-wide', 'layout-square', 'layout-story')

  switch (preset) {
    case 'horizontal':
      width = 1200; height = 675; layoutClass = 'layout-wide'; break
    case 'square':
      width = 1000; height = 1000; layoutClass = 'layout-square'; break
    case 'vertical':
      width = 1080; height = 1920; layoutClass = 'layout-story'; break
    case 'og':
      width = 1200; height = 630; layoutClass = 'layout-wide'; break
    default:
      width = 1200; height = 675; layoutClass = 'layout-wide'
  }

  githubCard.classList.add(layoutClass)
  captureArea.style.width = `${width}px`
  captureArea.style.height = `${height}px`

  // Improved responsive scaling
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const isMobile = viewportWidth < 768
  const isSmallMobile = viewportWidth < 480

  // Calculate available space with proper padding
  const containerPadding = isSmallMobile ? 32 : isMobile ? 64 : 128
  const availableWidth = viewportWidth - containerPadding
  const availableHeight = viewportHeight * (isMobile ? 0.4 : 0.6)

  // Calculate scale to fit both width and height, with max scale of 1
  const scaleWidth = availableWidth / width
  const scaleHeight = availableHeight / height
  const scale = Math.min(scaleWidth, scaleHeight, 1)

  captureArea.style.transform = `scale(${scale})`
  captureArea.style.transformOrigin = 'top center'

  // Compensate for layout space (remove whitespace around scaled element)
  const verticalSpaceRemoved = height * (1 - scale)
  const horizontalSpaceRemoved = width * (1 - scale) / 2

  captureArea.style.marginBottom = `-${verticalSpaceRemoved}px`
  // Reduce layout width effectively to prevent horizontal scrolling
  if (scale < 1) {
    captureArea.style.marginLeft = `-${horizontalSpaceRemoved}px`
    captureArea.style.marginRight = `-${horizontalSpaceRemoved}px`
  } else {
    captureArea.style.marginLeft = '0'
    captureArea.style.marginRight = '0'
  }
}

// Initial Call
window.addEventListener('resize', updateSize)
updateSize()

// Event Listeners
// Stats Input Elements
const inputStars = document.getElementById('input-stars')
const inputForks = document.getElementById('input-forks')
const inputWatchers = document.getElementById('input-watchers')
const toggleThemeGrid = document.getElementById('toggle-theme-grid')
const themeGrid = document.getElementById('theme-grid')

// Theme Grid Toggle
let isThemeGridExpanded = false
themeGrid.classList.add('collapsed')

toggleThemeGrid.addEventListener('click', () => {
  isThemeGridExpanded = !isThemeGridExpanded
  if (isThemeGridExpanded) {
    themeGrid.classList.remove('collapsed')
    toggleThemeGrid.textContent = 'Show Less'
  } else {
    themeGrid.classList.add('collapsed')
    toggleThemeGrid.textContent = 'Show All'
  }
})

// Live Stats Update
const updateStats = () => {
  cardStars.textContent = formatNum(inputStars.value || 0)
  cardForks.textContent = formatNum(inputForks.value || 0)
  cardWatchers.textContent = formatNum(inputWatchers.value || 0)
}

inputStars.addEventListener('input', updateStats)
inputForks.addEventListener('input', updateStats)
inputWatchers.addEventListener('input', updateStats)

// Populate inputs when data is fetched
const populateStats = (details) => {
  inputStars.value = details.stargazers_count
  inputForks.value = details.forks_count
  inputWatchers.value = details.watchers_count
}

generateBtn.addEventListener('click', async () => {
  const url = repoUrlInput.value.trim()
  if (!url) return

  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) {
    alert('Please enter a valid GitHub URL')
    return
  }

  const owner = match[1]
  const repo = match[2].replace('.git', '')

  generateBtn.disabled = true
  generateBtn.innerHTML = '<span style="opacity: 0.5;">Generating...</span>'

  try {
    const details = await updateCard(owner, repo)
    populateStats(details) // Populate inputs with default data
  } finally {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.7 },
      colors: ['#58a6ff', '#bc8cff', '#ffffff']
    })

    generateBtn.disabled = false
    generateBtn.innerHTML = 'Generate'
  }
})

downloadBtn.addEventListener('click', async () => {
  if (isGenerating) return
  isGenerating = true

  downloadBtn.disabled = true
  downloadBtn.textContent = 'Processing Image...'

  try {
    const format = exportFormat.value
    const fileName = `GitSnap-${Date.now()}.${format}`

    // Capture the card directly, not the wrapper
    const options = {
      quality: 1,
      pixelRatio: 3, // Back to 3 since base dimensions are larger now
      cacheBust: true,
      useCORS: true,
      style: {
        '-webkit-font-smoothing': 'antialiased',
        'text-rendering': 'optimizeLegibility'
      }
    }

    let dataUrl
    if (format === 'png') {
      dataUrl = await toPng(githubCard, options)
    } else {
      dataUrl = await toJpeg(githubCard, { ...options, quality: 0.98 })
    }

    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()

  } catch (error) {
    console.error('Download failed', error)
    alert('Failed to generate high-res image. Please try again.')
  } finally {
    isGenerating = false
    downloadBtn.disabled = false
    downloadBtn.textContent = 'Download Masterpiece'
  }
})

// Toggle Logic
toggleExplorer.addEventListener('change', (e) => {
  explorerSidebar.style.display = e.target.checked ? 'flex' : 'none'
  updateLayoutState()
})

toggleReadme.addEventListener('change', (e) => {
  readmeContainer.style.display = e.target.checked ? 'block' : 'none'
  updateLayoutState()
})

function updateLayoutState() {
  if (!toggleReadme.checked) {
    githubCard.classList.add('no-readme')
  } else {
    githubCard.classList.remove('no-readme')
  }
}

sizePreset.addEventListener('change', updateSize)

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    themeButtons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    githubCard.style.background = btn.dataset.gradient

    // Apply light mode class if selected
    if (btn.dataset.mode === 'light') {
      githubCard.classList.add('theme-light')
    } else {
      githubCard.classList.remove('theme-light')
    }
  })
})

repoUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') generateBtn.click()
})
