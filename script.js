document.addEventListener('DOMContentLoaded', function() {
    const convertBtn = document.getElementById('convert-btn');
    const amountInput = document.getElementById('amount');
    const resultsContainer = document.getElementById('results-container');
    
    // En una aplicación real, esta clave debería estar en el servidor por seguridad
    const apiKey = '2cbac5dfbcc856a42f0247f2'; // Esta es una clave de ejemplo
    const apiURL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    
    // Tasas de cambio de respaldo en caso de que falle la API
    const backupRates = {
        PYG: 7300, // Guaraní paraguayo
        ARS: 350,  // Peso argentino
        BRL: 5.10  // Real brasileño
    };
    
    convertBtn.addEventListener('click', convertCurrency);
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });
    
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            showError('Por favor, ingresa un monto válido mayor a cero.');
            return;
        }
        
        showLoading('Calculando tasas de cambio...');
        
        try {
            const response = await fetch(apiURL);
            
            if (!response.ok) {
                throw new Error('Error al conectar con la API. Usando tasas de respaldo.');
            }
            
            const data = await response.json();
            
            if (data.result !== 'success') {
                throw new Error('Error en la respuesta de la API. Usando tasas de respaldo.');
            }
            
            displayResults(amount, data.conversion_rates);
            
        } catch (error) {
            console.error(error);
            // Usar tasas de respaldo si la API falla
            displayResults(amount, backupRates, true);
        }
    }
    
    function displayResults(amount, rates, isBackup = false) {
        const currencies = [
            { code: 'PYG', name: 'Guaraní Paraguayo', flag: '🇵🇾', className: 'pyg' },
            { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷', className: 'ars' },
            { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷', className: 'brl' }
        ];
        
        let html = '';
        
        currencies.forEach(currency => {
            const rate = rates[currency.code];
            const convertedValue = (amount * rate).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            html += `
                <div class="currency-card ${currency.className}">
                    <div class="currency-flag">${currency.flag}</div>
                    <div class="currency-info">
                        <div class="currency-name">${currency.name}</div>
                        <div class="currency-code">${currency.code}</div>
                    </div>
                    <div class="currency-value">${convertedValue}</div>
                </div>
            `;
        });
        
        if (isBackup) {
            html += `<div class="error">Nota: Se están utilizando tasas de cambio de respaldo. Los valores pueden no estar actualizados.</div>`;
        }
        
        resultsContainer.innerHTML = html;
    }
    
    function showLoading(message) {
        resultsContainer.innerHTML = `<div class="loading">${message}</div>`;
    }
    
    function showError(message) {
        resultsContainer.innerHTML = `<div class="error">${message}</div>`;
    }
});
