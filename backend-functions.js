// Backend API function for sending download links
async function sendDownloadLinkToBackend(method, contact) {
    try {
        const appUrl = window.location.origin + window.location.pathname;
        const downloadMessage = method === 'sms' 
            ? `Get Ben's Workout App: ${appUrl} - Your complete 30-minute workout routine!`
            : `Hi! Here's your download link for Ben's Workout App: ${appUrl}\n\nYour complete 30-minute workout routine with timer and progress tracking.\n\nStay fit!`;
        
        const response = await fetch('/api/send-download-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: method,
                contact: contact,
                message: downloadMessage,
                appUrl: appUrl
            })
        });
        
        if (!response.ok) {
            // If backend API isn't available, fall back to client-side solutions
            return await handleDownloadLinkFallback(method, contact, downloadMessage);
        }
        
        const result = await response.json();
        return result.success || false;
    } catch (error) {
        console.log('Backend API not available, using fallback method');
        const appUrl = window.location.origin + window.location.pathname;
        const downloadMessage = method === 'sms' 
            ? `Get Ben's Workout App: ${appUrl} - Your complete 30-minute workout routine!`
            : `Hi! Here's your download link for Ben's Workout App: ${appUrl}\n\nYour complete 30-minute workout routine with timer and progress tracking.\n\nStay fit!`;
        return await handleDownloadLinkFallback(method, contact, downloadMessage);
    }
}

// Fallback methods for sending download links
async function handleDownloadLinkFallback(method, contact, message) {
    if (method === 'sms') {
        // Try to open SMS app on mobile devices
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            const smsUrl = `sms:${contact}?body=${encodeURIComponent(message)}`;
            window.open(smsUrl, '_system');
            return true;
        } else {
            // On desktop, show instructions
            alert(`Please text this message to ${contact}:\n\n${message}`);
            return true;
        }
    } else {
        // Open email client
        const subject = "Ben's Workout App - Download Link";
        const mailtoUrl = `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(mailtoUrl, '_system');
        return true;
    }
}