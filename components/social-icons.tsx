import React from 'react';

export const SocialIcons = () => {
    return (
        <div className="flex justify-center gap-4 mt-8">
            {/* Instagram */}
            <a
                href="https://instagram.com/brototype.malayalam"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-white rounded-full cursor-pointer flex items-center justify-center shadow-lg transition-all hover:shadow-[5px_5px_10px_rgba(24,23,23,0.8)]"
            >
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 px-3 py-1 rounded text-xs text-white bg-gradient-to-tr from-[#0000ff] to-[#f56040] whitespace-nowrap z-20">
                    Instagram
                </span>
                <div className="absolute bottom-0 left-0 w-full h-0 group-hover:h-full transition-[height] duration-300 ease-in-out bg-gradient-to-tr from-[#0000ff] to-[#f56040] rounded-full z-0" />
                <div className="relative z-10 text-black group-hover:text-white transition-colors duration-300">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fillRule="evenodd" fill="currentColor" />
                    </svg>
                </div>
            </a>

            {/* LinkedIn */}
            <a
                href="https://linkedin.com/company/brototype"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-white rounded-full cursor-pointer flex items-center justify-center shadow-lg transition-all hover:shadow-[5px_5px_10px_rgba(24,23,23,0.8)]"
            >
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 px-3 py-1 rounded text-xs text-white bg-[#0274b3] whitespace-nowrap z-20">
                    Linkedin
                </span>
                <div className="absolute bottom-0 left-0 w-full h-0 group-hover:h-full transition-[height] duration-300 ease-in-out bg-[#0274b3] rounded-full z-0" />
                <div className="relative z-10 text-black group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="4.983" cy="5.009" r="2.188" />
                        <path d="M9.237 8.855v12.139h3.769v-6.003c0-1.584.298-3.118 2.262-3.118 1.937 0 1.961 1.811 1.961 3.218v5.904H21v-6.657c0-3.27-.704-5.783-4.526-5.783-1.835 0-3.065 1.007-3.568 1.96h-.051v-1.66H9.237zm-6.142 0H6.87v12.139H3.095z" />
                    </svg>
                </div>
            </a>

            {/* YouTube */}
            <a
                href="https://www.youtube.com/@BrototypeMalayalam"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-white rounded-full cursor-pointer flex items-center justify-center shadow-lg transition-all hover:shadow-[5px_5px_10px_rgba(24,23,23,0.8)]"
            >
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 px-3 py-1 rounded text-xs text-white bg-[#ff0000] whitespace-nowrap z-20">
                    YouTube
                </span>
                <div className="absolute bottom-0 left-0 w-full h-0 group-hover:h-full transition-[height] duration-300 ease-in-out bg-[#ff0000] rounded-full z-0" />
                <div className="relative z-10 text-black group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 0 0 1.767-1.763c.414-1.565.417-4.812.417-4.812s.02-3.265-.407-4.831zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z" />
                    </svg>
                </div>
            </a>
        </div>
    );
};
