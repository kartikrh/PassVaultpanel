import React, { useEffect, useState } from 'react';
import Toast from './Toast';
import './Toast.css';

const SocketNotificationHandler = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);

  const NOTIFICATION_MESSAGES = {
    // Disconnect messages
    clientsocketdisconnect: 'Client socket has been disconnected. Please check the connection.',
    entitysocketdisconnect: 'Entity socket has been disconnected. Please connect.',
    entitywebsocketdisconnect: 'Entity WebSocket has been disconnected. Please connect again.',
    
    // Connect messages
    clientsocketconnect: 'Client socket connected successfully.',
    clientsocketreconnect: 'Client socket reconnected successfully.',
    entitysocketconnect: 'Entity socket connected successfully.',
    entitywebsocketconnect: 'Entity WebSocket connected successfully.'
  };

  // Map connection events to their corresponding disconnect types
  const CONNECTION_TO_DISCONNECT_MAP = {
    clientsocketconnect: ['clientsocketdisconnect'],
    clientsocketreconnect: ['clientsocketdisconnect'],
    entitysocketconnect: ['entitysocketdisconnect'],
    entitywebsocketconnect: ['entitywebsocketdisconnect']
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
            message: message,
            toastType: 'error',
            autoClose: false
          }];
        });
      }
    };

    const handleConnectEvent = (eventName) => {
      const message = NOTIFICATION_MESSAGES[eventName];
      if (message) {
        // Remove corresponding disconnect notifications
        const disconnectTypes = CONNECTION_TO_DISCONNECT_MAP[eventName] || [];
        setNotifications(prev => 
          prev.filter(n => !disconnectTypes.includes(n.type))
        );

        // Add success notification with auto-dismiss
        setNotifications(prev => [...prev, {
          id: `${eventName}-${Date.now()}`,
          type: eventName,
          message: message,
          toastType: 'success',
          autoClose: true,
          duration: 4000 // 4 seconds
        }]);
      }
    };

    // Disconnect event listeners
    socket.on('clientsocketdisconnect', () => handleDisconnectEvent('clientsocketdisconnect'));
    socket.on('entitysocketdisconnect', () => handleDisconnectEvent('entitysocketdisconnect'));
    socket.on('entitywebsocketdisconnect', () => handleDisconnectEvent('entitywebsocketdisconnect'));

    // Connect event listeners
    socket.on('clientsocketconnect', () => handleConnectEvent('clientsocketconnect'));
    socket.on('clientsocketreconnect', () => handleConnectEvent('clientsocketreconnect'));
    socket.on('entitysocketconnect', () => handleConnectEvent('entitysocketconnect'));
    socket.on('entitywebsocketconnect', () => handleConnectEvent('entitywebsocketconnect'));

    return () => {
      socket.off('clientsocketdisconnect');
      socket.off('entitysocketdisconnect');
      socket.off('entitywebsocketdisconnect');
      
      socket.off('clientsocketconnect');
      socket.off('clientsocketreconnect');
      socket.off('entitysocketconnect');
      socket.off('entitywebsocketconnect');
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
          type={notification.toastType}
          autoClose={notification.autoClose}
          duration={notification.duration}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default SocketNotificationHandler;