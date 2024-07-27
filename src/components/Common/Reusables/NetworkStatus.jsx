import React, { useEffect, useState } from 'react';
import { FaWifi } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const NetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState('unknown');
    const [latency, setLatency] = useState(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const token = useSelector((state) => state.user.token);
    let socket;

    useEffect(() => {
        const measureLatency = () => {
            if (socket) {
                const start = Date.now();
                socket.emit('ping');
                socket.once('pong', () => {
                    const latencyTime = Date.now() - start;
                    setLatency(latencyTime);

                    if (latencyTime < 100) {
                        setNetworkStatus('best');
                    } else if (latencyTime < 200) {
                        setNetworkStatus('good');
                    } else if (latencyTime < 500) {
                        setNetworkStatus('ok');
                    } else if (latencyTime < 1000) {
                        setNetworkStatus('low');
                    } else {
                        setNetworkStatus('none');
                    }
                });
            }
        };

        if (token) {
            socket = io.connect(process.env.REACT_APP_SOCKET_URL, {
                transports: ["websocket"],
                auth: { token }
            });

            socket.on('connect', () => {
                setIsSocketConnected(true);
                measureLatency();
            });

            socket.on('disconnect', () => {
                setIsSocketConnected(false);
            });

            const interval = setInterval(() => {
                measureLatency();
            }, 500);

            return () => {
                clearInterval(interval);
                if (socket) socket.disconnect();
            };
        }
    }, [token]);

    const getColor = () => {
        if (!isSocketConnected) return 'gray';
        switch (networkStatus) {
            case 'best': return 'darkgreen';
            case 'good': return 'green';
            case 'ok': return 'yellow';
            case 'low': return 'red';
            case 'none': return 'darkred';
            default: return 'gray';
        }
    };

    return (
        <div>
            <div className='d-flex'>
                <FaWifi color={getColor()} size={32} />
                <div className='pl-2'>
                    <span>Latency: {latency !== null ? `${latency} ms` : 'N/A'}</span>
                    <br />
                    <span>Speed: {networkStatus !== 'unknown' ? networkStatus : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default NetworkStatus;
