import { useState, useEffect } from 'react';

const useLocation = () => {
    const [location, setLocation] = useState({
        lat: null,
        lng: null,
        error: null,
        loading: false
    });

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation not supported' }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    error: null,
                    loading: false
                });
            },
            (error) => {
                let msg = 'Location access denied';
                if (error.code === 2) msg = 'Location unavailable';
                if (error.code === 3) msg = 'Location request timeout';

                setLocation({
                    lat: null,
                    lng: null,
                    error: msg,
                    loading: false
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return { ...location, requestLocation };
};

export { useLocation };
