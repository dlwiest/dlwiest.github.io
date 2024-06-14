// Traps focus in a given element
let releaseTrapFocus;
const trapFocus = (element) => {
    const focusableElements = element.querySelectorAll(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const trap = (e) => {
        const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // Tabbing up
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // Tabbing down
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }

    element.addEventListener('keydown', trap);

    return () => {
        element.removeEventListener('keydown', trap);
    }
};

// Hamburger menu
let isHamburgerMenuOpen = false;

const closeHamburgerMenuOnEscape = (e) => {
    if (e.key === 'Escape') {
        toggleHamburgerMenu();
    }
}

const toggleHamburgerMenu = () => {
    const hamburgerMenu = document.querySelector(
        "#navbar-container nav #hamburger-menu"
    );
    hamburgerMenu.classList.toggle("open");
    isHamburgerMenuOpen = hamburgerMenu.classList.contains("open");

    if (isHamburgerMenuOpen) { // Capture ecape and trap focus on open
        document.addEventListener('keydown', closeHamburgerMenuOnEscape);
        releaseTrapFocus = trapFocus(hamburgerMenu);
    } else { // Clean up on close
        document.removeEventListener('keydown', closeHamburgerMenuOnEscape);
        releaseTrapFocus();
    }
};

(() => {
    const hamburgerMenuButton = document.querySelector(
        "#navbar-container nav #hamburger-button"
    );
    hamburgerMenuButton.addEventListener("click", toggleHamburgerMenu);
})();

// Smooth scrolling anchors
(() => {
    for (let anchor of document.querySelectorAll('a[href^="#"]')) {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            if (isHamburgerMenuOpen) {
                toggleHamburgerMenu();
            }

            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth",
            });
        });
    }
})();

// Contact form
(() => {
    const accessKey = "28683c12-4770-4cc2-aa82-bf220676c336";
    const form = document.querySelector("#contact form");
    let isSubmitting = false;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        // Prevent resubmitting the form while submitting
        isSubmitting = true;
        const button = e.target.querySelector(".button");
        button.disabled = true;

        // Preserve the container height to prevent jarring collapse
        const contactContainer = document.querySelector("#contact");

        const containerClientHeight = contactContainer.clientHeight;
        const containerComputedStyle = window.getComputedStyle(contactContainer);
        const containerMargin = parseInt(containerComputedStyle.paddingTop, 10) + parseInt(containerComputedStyle.paddingBottom, 10);
        const containerHeight = containerClientHeight - containerMargin;

        // Try to send the message
        const name = document.querySelector("#contact-name").value;
        const email = document.querySelector("#contact-email").value;
        const message = document.querySelector("#contact-message").value;

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    name,
                    email,
                    message,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Fix the height of the container
                document.querySelector("#contact").style.height = `${containerHeight}px`;

                // Replace form with sent notification
                const sent = document.createElement("div");
                sent.innerHTML ="<p>Thank you for your message! I'll get back to you soon.</p>";
                form.parentNode.replaceChild(sent, form);
            } else {
                console.error("Error sending email", data.message);
            }
        } catch (error) {
            console.error("Error sending email", error);
        } finally {
            isSubmitting = false;
            button.disabled = false;
        }
    });
})();
