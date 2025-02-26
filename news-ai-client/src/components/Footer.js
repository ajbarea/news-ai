import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
                <span className="text-lg" aria-label="News">📰</span>
                NewsAI  • SWEN-732 • Group 3 • {currentYear}
            </div>
        </div>
    );
}

export default Footer;
