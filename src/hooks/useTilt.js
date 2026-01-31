import { useEffect } from 'react';

const useTilt = (selector) => {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);

        const handleMouseMove = (e, el) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg for subtle feel
            const rotateY = ((x - centerX) / centerX) * 10;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            el.style.boxShadow = `
                ${-rotateY}px ${rotateX}px 30px rgba(0, 93, 171, 0.2),
                0 10px 25px -5px rgba(0, 0, 0, 0.1)
            `;
        };

        const handleMouseLeave = (el) => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            el.style.boxShadow = `var(--glass-shadow)`;
        };

        elements.forEach(el => {
            const moveFn = (e) => handleMouseMove(e, el);
            const leaveFn = () => handleMouseLeave(el);

            el.addEventListener('mousemove', moveFn);
            el.addEventListener('mouseleave', leaveFn);

            // Cleanup
            el._tiltCleanup = () => {
                el.removeEventListener('mousemove', moveFn);
                el.removeEventListener('mouseleave', leaveFn);
            };
        });

        return () => {
            elements.forEach(el => {
                if (el._tiltCleanup) el._tiltCleanup();
            });
        };
    }, [selector]);
};

export default useTilt;
