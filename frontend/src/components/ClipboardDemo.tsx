import React from 'react';

declare global {
  interface Window {
    ClipboardUtils: {
      copyToClipboard: (text: string) => void;
      showNotification: (message: string) => void;
    };
  }
}

const ClipboardDemo: React.FC = () => {
  const handleCopy = () => {
    if (window.ClipboardUtils) {
      window.ClipboardUtils.copyToClipboard('Hello from React and vanilla JS!');
    } else {
      alert('ClipboardUtils not loaded');
    }
  };

  return (
    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
      <h3>Clipboard Demo (Vanilla JS from React)</h3>
      <button className="btn btn-primary" onClick={handleCopy}>
        Copy Demo Text
      </button>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Click the button to copy text using a vanilla JS utility.<br/>
        You should see a notification at the bottom of the screen.
      </p>
    </div>
  );
};

export default ClipboardDemo; 