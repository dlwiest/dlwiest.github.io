(() => {
    const accessKey = '28683c12-4770-4cc2-aa82-bf220676c336';
    const form = document.querySelector('#contact form');
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        // Prevent resubmitting the form while submitting
        isSubmitting = true;
        const button = e.target.querySelector('.button');
        button.disabled = true;

        // Preserve the container height to prevent jarring collapse
        const contactContainer = document.querySelector('#contact');

        const containerClientHeight = contactContainer.clientHeight;
        const containerComputedStyle = window.getComputedStyle(contactContainer);
        const containerMargin = parseInt(containerComputedStyle.paddingTop, 10) + parseInt(containerComputedStyle.paddingBottom, 10);
        const containerHeight = containerClientHeight - containerMargin;

        const name = document.querySelector('#contact-name').value;
        const email = document.querySelector('#contact-email').value;
        const message = document.querySelector('#contact-message').value;

        try {
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
            });

            const data = await response.json();
            if (data.success) {
                // Fix the height of the container
                document.querySelector('#contact').style.height = `${containerHeight}px`;

                // Replace form with sent notification
                const sent = document.createElement('div');
                sent.innerHTML = 'Thank you for your message! I will get back to you soon.';
                form.parentNode.replaceChild(sent, form);
            } else {
                console.error('Error sending email', data.message);
            }
        } catch (error) {
            console.error('Error sending email', error);
        } finally {
            isSubmitting = false;
            button.disabled = false;
        }
    })
})();

