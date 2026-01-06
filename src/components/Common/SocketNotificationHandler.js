import React, { useEffect, useState } from 'react';
import Toast from './Toast';
import './Toast.css';

const SocketNotificationHandler = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);

  const NOTIFICATION_MESSAGES = {
    clientdisconnect: 'Client socket has been disconnected. Please check the connection.',
    entitydisconnect: 'Entity socket has been disconnected. Please connect.',
    entitywebsocketdisconnect: 'Entity WebSocket has been disconnected. Please connect again.'
  };

  useEffect(() => {
    if (!socket) return;

    const handleDisconnectEvent = (eventName) => {
      const message = NOTIFICATION_MESSAGES[eventName];
      if (message) {
        setNotifications(prev => {
          const exists = prev.some(n => n.type === eventName);
          if (exists) return prev;
          
          return [...prev, {
            id: `${eventName}-${Date.now()}`,
            type: eventName,
            message: message
          }];
        });
      }
    };

    socket.on('clientdisconnect', () => handleDisconnectEvent('clientdisconnect'));
    socket.on('entitydisconnect', () => handleDisconnectEvent('entitydisconnect'));
    socket.on('entitywebsocketdisconnect', () => handleDisconnectEvent('entitywebsocketdisconnect'));

    return () => {
      socket.off('clientdisconnect');
      socket.off('entitydisconnect');
      socket.off('entitywebsocketdisconnect');
    };
  }, [socket]);

  const handleClose = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type="error"
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default SocketNotificationHandler;