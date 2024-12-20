class TabPanel {
  constructor(element) {
    this.element = element
    this.tabs = this.element.querySelectorAll('[data-tab]')
    this.contents = this.element.querySelectorAll('[data-tab-content]')
    this.backButton = this.element.querySelector('[data-nav-arrow-back')
    this.nextButton = this.element.querySelector('[data-nav-arrow-next')
    this.selectedIndex = 0

    this.init()
  }

  init() {
    this.tabs.forEach((tab, i) => {
      if (tab.getAttribute('aria-selected') === 'true') {
        this.selectedIndex = i
      } else {
        this.contents[i].setAttribute('aria-hidden', 'true')
      }

      tab.addEventListener('click', () => {
        this.selectTab(i)
      })
    })

    this.backButton.addEventListener('click', () => this.goBack())
    this.nextButton.addEventListener('click', () => this.goForward())
  }

  selectTab(index) {
    this.selectedIndex = index

    for (let i = 0; i < this.tabs.length; i++) {
      const active = i === this.selectedIndex ? 'true' : 'false'
      this.tabs[i].setAttribute('aria-selected', active)
      this.contents[i].setAttribute('aria-hidden', active === 'true' ? 'false' : 'true')
    }

    if (window.innerWidth <= 480) {
      this.element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  goBack() {
    const newIndex = this.selectedIndex ? this.selectedIndex - 1 : this.tabs.length - 1
    this.selectTab(newIndex)
  }

  goForward() {
    const newIndex = this.selectedIndex < this.tabs.length - 1 ? this.selectedIndex + 1 : 0
    this.selectTab(newIndex)
  }
}

// Initialize tab panels
document.querySelectorAll('[data-component="tab-panel"]').forEach((panel) => new TabPanel(panel))

// Hamburger menu
let isHamburgerMenuOpen = false

const hamburgerMenuButton = document.querySelector('#navbar-container nav button')
const hamburgerMenu = document.querySelector('#navigation-menu')

// Function to trap focus within the menu when it is open
let releaseTrapFocus
const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]

  const trap = (e) => {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9

    if (!isTabPressed) {
      return
    }

    if (e.shiftKey) {
      // Tabbing up
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus()
        e.preventDefault()
      }
    } else {
      // Tabbing down
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', trap)

  return () => {
    element.removeEventListener('keydown', trap)
  }
}

// Function to close the hamburger menu when the Escape key is pressed
const closeHamburgerMenuOnEscape = (e) => {
  if (e.key === 'Escape') {
    toggleHamburgerMenu()
  }
}

// Function to toggle the hamburger menu
const toggleHamburgerMenu = () => {
  hamburgerMenu.classList.toggle('open')
  isHamburgerMenuOpen = hamburgerMenu.classList.contains('open')

  if (isHamburgerMenuOpen) {
    document.addEventListener('keydown', closeHamburgerMenuOnEscape)
    releaseTrapFocus = trapFocus(hamburgerMenu)
  } else {
    document.removeEventListener('keydown', closeHamburgerMenuOnEscape)
    if (releaseTrapFocus) releaseTrapFocus()
  }
}

;(() => {
  // Add click event listener to the hamburger menu button
  hamburgerMenuButton.addEventListener('click', toggleHamburgerMenu)

  // Add click event listener to the document to handle clicks outside the menu
  document.addEventListener('click', function (event) {
    const isClickInsideMenu = hamburgerMenu.contains(event.target)
    const isClickOnButton = hamburgerMenuButton.contains(event.target)

    if (!isClickInsideMenu && !isClickOnButton && isHamburgerMenuOpen) {
      toggleHamburgerMenu()
    }
  })
})()

// Smooth scrolling anchors
;(() => {
  for (let anchor of document.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      if (isHamburgerMenuOpen) {
        toggleHamburgerMenu()
      }

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth',
      })
    })
  }
})()

// Contact form
;(() => {
  const accessKey = '28683c12-4770-4cc2-aa82-bf220676c336'
  const form = document.querySelector('#contact form')
  let isSubmitting = false

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    // Prevent resubmitting the form while submitting
    isSubmitting = true
    const button = e.target.querySelector('.button')
    button.disabled = true

    // Preserve the container height to prevent jarring collapse
    const contactContainer = document.querySelector('#contact')

    const containerClientHeight = contactContainer.clientHeight
    const containerComputedStyle = window.getComputedStyle(contactContainer)
    const containerMargin =
      parseInt(containerComputedStyle.paddingTop, 10) + parseInt(containerComputedStyle.paddingBottom, 10)
    const containerHeight = containerClientHeight - containerMargin

    // Try to send the message
    const name = document.querySelector('#contact-name').value
    const email = document.querySelector('#contact-email').value
    const message = document.querySelector('#contact-message').value

    try {
      let data, isSpam

      // Getting a lot of weird one-word messages from bots
      if (message.split(' ').length < 2) {
        isSpam = true
      }

      if (!isSpam) {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_key: accessKey,
            name,
            email,
            message,
          }),
        })

        data = await response.json()
      }

      if (isSpam || data.success) {
        // Fix the height of the container
        document.querySelector('#contact').style.height = `${containerHeight}px`

        // Replace form with sent notification
        const sent = document.createElement('div')
        sent.innerHTML = "<p>Thank you for your message! If appropriate, I'll get back to you soon.</p>"
        form.parentNode.replaceChild(sent, form)
      } else {
        console.error('Error sending email', data.message)
      }
    } catch (error) {
      console.error('Error sending email', error)
    } finally {
      isSubmitting = false
      button.disabled = false
    }
  })
})()
