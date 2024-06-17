// Hamburger menu
let isHamburgerMenuOpen = false;

const hamburgerMenuButton = document.querySelector("#navbar-container nav button");
const hamburgerMenu = document.querySelector("#navigation-menu");

// Function to trap focus within the menu when it is open
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
    };

    element.addEventListener('keydown', trap);

    return () => {
        element.removeEventListener('keydown', trap);
    };
};

// Function to close the hamburger menu when the Escape key is pressed
const closeHamburgerMenuOnEscape = (e) => {
    if (e.key === 'Escape') {
        toggleHamburgerMenu();
    }
};

// Function to toggle the hamburger menu
const toggleHamburgerMenu = () => {
    hamburgerMenu.classList.toggle("open");
    isHamburgerMenuOpen = hamburgerMenu.classList.contains("open");

    if (isHamburgerMenuOpen) {
        document.addEventListener('keydown', closeHamburgerMenuOnEscape);
        releaseTrapFocus = trapFocus(hamburgerMenu);
    } else {
        document.removeEventListener('keydown', closeHamburgerMenuOnEscape);
        if (releaseTrapFocus) releaseTrapFocus();
    }
};

(() => {
    // Add click event listener to the hamburger menu button
    hamburgerMenuButton.addEventListener("click", toggleHamburgerMenu);

    // Add click event listener to the document to handle clicks outside the menu
    document.addEventListener('click', function (event) {
        const isClickInsideMenu = hamburgerMenu.contains(event.target);
        const isClickOnButton = hamburgerMenuButton.contains(event.target);

        if (!isClickInsideMenu && !isClickOnButton && isHamburgerMenuOpen) {
            toggleHamburgerMenu();
        }
    });
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

// Experience tabs
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const tabs = document.querySelectorAll('#experience-content .tabs input[type="radio"]');
        const panels = document.querySelectorAll('#experience-content .tab-panels .tab-panel');

        let selectedPanel;

        // Hide all panels by default
        for (let panel of panels) {
            panel.style.display = 'none';
        }

        tabs.forEach(tab => {
            tab.addEventListener('change', () => {
                // Hide the previously selected panel
                if (selectedPanel) {
                    selectedPanel.style.display = 'none';
                }

                // Show the panel corresponding to the checked tab
                selectedPanel = document.querySelector(`#experience-panel-${tab.id.split('-')[2]}`);
                if (selectedPanel) {
                    selectedPanel.style.display = 'flex';
                }
            });
        });

        // Initially display the first panel
        const initialPanel = document.querySelector('.tab-panels .tab-panel');
        if (initialPanel) {
            selectedPanel = initialPanel;
            initialPanel.style.display = 'flex';
        }

        // Allow navigation with arrow buttons
        const backButton = document.querySelector("#button-experience-back");
        const forwardButton = document.querySelector("#button-experience-forward");

        const onExperienceTraversal = (direction) => {
            const currentActiveTab = document.querySelector('#experience-content .tabs input[type="radio"]:checked');
            const index = Array.from(tabs).indexOf(currentActiveTab);
            const targetIndex = direction === "forward" ? index + 1 : index - 1;
            if (tabs[targetIndex]) {
                tabs[targetIndex].click();
            } else {
                tabs[direction === "forward" ? 0 : tabs.length - 1].click();
            }

            document.querySelector('#experience').scrollIntoView({
                behavior: "smooth",
            });
        };

        backButton.addEventListener("click", () => {
            onExperienceTraversal("back");
        });

        forwardButton.addEventListener("click", () => {
            onExperienceTraversal("forward");
        });
    });
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
                sent.innerHTML = "<p>Thank you for your message! I'll get back to you soon.</p>";
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
