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
            <div className='d-flex align-items-center'>
                <FaWifi color={getColor()} size={18} />
                {/* <div className='mx-2'> */}
                    <span className='mx-2' style={{fontSize: '12px'}}>Latency: <span style={{color: "#00BD35"}}>{latency !== null ? `${latency} ms` : 'N/A'}</span></span>
                    <br />
                    <span style={{fontSize: '12px'}}>Speed: <span style={{color: "#00BD35"}}>{networkStatus !== 'unknown' ? networkStatus : 'N/A'}</span></span>
                {/* </div> */}
            </div>
        </div>
    );
};

export default NetworkStatus;
