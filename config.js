window.FontAwesomeConfig = {
    autoReplaceSvg: 'nest'
};

tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Base colors
                transparent: 'transparent',
                current: 'currentColor',
                black: '#000000',
                white: '#ffffff',
                // ... rest of the color configurations from index.html
            }
        }
    },
    variants: {
        extend: {
            backgroundColor: ['active', 'group-hover'],
            textColor: ['active', 'group-hover'],
        }
    },
    plugins: []
}; 