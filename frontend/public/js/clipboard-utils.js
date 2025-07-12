// clipboard-utils.js
// Provides copyToClipboard and showNotification functions for use in React or plain HTML

window.ClipboardUtils = {
  copyToClipboard: function (text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        window.ClipboardUtils.showNotification('Copied to clipboard!');
      }, function (err) {
        window.ClipboardUtils.showNotification('Failed to copy!');
      });
    } else {
      // fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        window.ClipboardUtils.showNotification('Copied to clipboard!');
      } catch (err) {
        window.ClipboardUtils.showNotification('Failed to copy!');
      }
      document.body.removeChild(textarea);
    }
  },
  showNotification: function (message) {
    let notif = document.createElement('div');
    notif.className = 'clipboard-notification';
    notif.innerText = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.classList.add('show');
    }, 10);
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => document.body.removeChild(notif), 300);
    }, 2000);
  }
};

// Add some basic styles for the notification
(function () {
  if (document.getElementById('clipboard-utils-style')) return;
  var style = document.createElement('style');
  style.id = 'clipboard-utils-style';
  style.innerHTML = `
    .clipboard-notification {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) scale(0.95);
      background: #667eea;
      color: #fff;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      font-size: 1.1rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s, transform 0.3s;
      z-index: 9999;
      box-shadow: 0 4px 16px rgba(102,126,234,0.15);
    }
    .clipboard-notification.show {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
  `;
  document.head.appendChild(style);
})(); 