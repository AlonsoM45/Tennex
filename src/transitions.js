export function expand(node, {delay = 0, duration = 300, totalHeight= 200}){
    return {
        duration,
        delay,
        css: t => {
            return `
                height: ${t*totalHeight}px;
                opacity: ${t*100}%;    
            `;
        }
    };
}