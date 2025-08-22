// YATSC Data Extractor Script
// Paste this into the browser console on the YATSC page

(function() {
    console.log('🎸 YATSC Data Extractor Starting...');
    
    // Try multiple methods to find the chart data
    let chartData = null;
    
    // Method 1: Look for ECharts instance
    if (window.echarts) {
        const charts = window.echarts.getInstanceByDom ? 
            [window.echarts.getInstanceByDom(document.querySelector('canvas'))] :
            Object.values(window.echarts._instances || {});
            
        if (charts && charts[0]) {
            const chart = charts[0];
            const option = chart.getOption();
            if (option && option.series && option.series[0]) {
                chartData = option.series[0].data;
                console.log('✅ Found ECharts data:', chartData.length, 'points');
            }
        }
    }
    
    // Method 2: Look for global variables
    if (!chartData) {
        const possibleVars = ['frequencyData', 'plotData', 'responseData', 'chartData', 'data'];
        for (const varName of possibleVars) {
            if (window[varName] && Array.isArray(window[varName])) {
                chartData = window[varName];
                console.log('✅ Found data in window.' + varName + ':', chartData.length, 'points');
                break;
            }
        }
    }
    
    // Method 3: Look in Vue/React components
    if (!chartData) {
        const canvases = document.querySelectorAll('canvas');
        for (const canvas of canvases) {
            if (canvas.__vue__ || canvas._reactInternalFiber) {
                console.log('🔍 Found Vue/React component, checking for data...');
                // This would need specific knowledge of YATSC's component structure
            }
        }
    }
    
    // Method 4: Try to extract from DOM elements
    if (!chartData) {
        console.log('🔍 Searching DOM for data attributes...');
        const dataElements = document.querySelectorAll('[data-frequency], [data-magnitude]');
        if (dataElements.length > 0) {
            console.log('✅ Found DOM elements with frequency data');
        }
    }
    
    // If we found data, format it
    if (chartData && chartData.length > 0) {
        console.log('📊 Processing', chartData.length, 'data points...');
        
        // Format the data for our use
        const formattedData = chartData.map((point, index) => {
            if (Array.isArray(point)) {
                // [frequency, magnitude] format
                return {
                    frequency: point[0],
                    magnitude: point[1],
                    phase: point[2] || 0
                };
            } else if (typeof point === 'object') {
                // Object format
                return {
                    frequency: point.frequency || point.x || point.freq,
                    magnitude: point.magnitude || point.y || point.mag || point.db,
                    phase: point.phase || 0
                };
            }
            return null;
        }).filter(p => p !== null);
        
        console.log('🎯 Formatted Data (copy this):');
        console.log('export const YATSC_MARSHALL_NOON = ' + JSON.stringify(formattedData, null, 2) + ';');
        
        // Also create a simple array format
        const simpleFormat = formattedData.map(p => `{ frequency: ${p.frequency}, magnitude: ${p.magnitude}, phase: ${p.phase} }`);
        console.log('\n📋 Simple format:');
        console.log('[' + simpleFormat.join(',\n  ') + ']');
        
        return formattedData;
    } else {
        console.log('❌ Could not find chart data automatically.');
        console.log('🔧 Manual extraction options:');
        console.log('1. Check window object:', Object.keys(window).filter(k => k.includes('data') || k.includes('chart')));
        console.log('2. Try: Object.keys(window).forEach(k => console.log(k, typeof window[k]))');
        console.log('3. Look for canvas elements:', document.querySelectorAll('canvas'));
        
        // Return a helper function for manual extraction
        window.extractYATSCData = function(dataArray) {
            if (!Array.isArray(dataArray)) {
                console.log('❌ Please provide an array of data points');
                return;
            }
            
            const formatted = dataArray.map(point => ({
                frequency: point[0] || point.frequency || point.x,
                magnitude: point[1] || point.magnitude || point.y,
                phase: point[2] || point.phase || 0
            }));
            
            console.log('export const YATSC_MARSHALL_NOON = ' + JSON.stringify(formatted, null, 2) + ';');
            return formatted;
        };
        
        console.log('💡 If you can find the data manually, call: extractYATSCData(yourDataArray)');
    }
})();

console.log('🎸 YATSC Data Extractor loaded! Check the output above.');