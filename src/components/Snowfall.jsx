import { useEffect, useState } from 'react';
import '../styles/index.css';

const Snowfall = () => {
    const [flakes, setFlakes] = useState([]);

    useEffect(() => {
        // Generate 50 static snowflakes positions
        const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // 0-100%
            animationDuration: 5 + Math.random() * 10, // 5-15s
            animationDelay: Math.random() * 5, // 0-5s
            opacity: 0.3 + Math.random() * 0.5,
            size: 0.5 + Math.random() * 1 // 0.5 - 1.5em
        }));
        setFlakes(newFlakes);
    }, []);

    return (
        <div className="wallpaper">
            {flakes.map(flake => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: `${flake.left}%`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `-${flake.animationDelay}s`, // Negative delay starts animation mid-cycle
                        opacity: flake.opacity,
                        fontSize: `${flake.size}em`
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};

export default Snowfall;
