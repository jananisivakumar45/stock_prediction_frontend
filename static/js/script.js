document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("prediction-form");
    const resultsSection = document.getElementById("results");
    const predictedPricesList = document.getElementById("predicted-prices");
    const loadingSpinner = document.getElementById("loading-spinner");
    const errorMessage = document.getElementById("error-message");
    const generateVisualButton = document.getElementById("generate-visual");
    const stockPriceChartCanvas = document.getElementById("stock-price-chart");

    let chartData = { labels: [], prices: [] }; // Hold the chart data for later use

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Clear previous results and show loading spinner
        predictedPricesList.innerHTML = "";
        loadingSpinner.classList.remove("hidden");
        errorMessage.classList.add("hidden"); // Hide any previous error messages

        // Get values from input fields
        const ticker = document.getElementById("ticker").value.trim(); // Ensure no extra spaces
        const days = document.getElementById("days").value.trim(); // Ensure no extra spaces

        // Log values for debugging
        console.log("Ticker:", ticker);
        console.log("Days:", days);

        // Check if the inputs are empty before proceeding
        if (!ticker) {
            errorMessage.textContent = "Please provide a stock ticker.";
            errorMessage.classList.remove("hidden");
            loadingSpinner.classList.add("hidden");
            return;
        }

        if (!days || isNaN(days) || Number(days) <= 0) {
            errorMessage.textContent = "Please provide a valid number of days.";
            errorMessage.classList.remove("hidden");
            loadingSpinner.classList.add("hidden");
            return;
        }

        try {
            const response = await fetch("https://stock-prediction-backend-k21j.onrender.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ticker, days: Number(days) }), // Convert days to a number
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Prediction failed");
            }

            const predictedData = await response.json();

            // Hide loading spinner and display predictions
            loadingSpinner.classList.add("hidden");

            predictedData.forEach(({ date, price }) => {
                // Create card for each predicted price
                const card = document.createElement("div");
                card.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "transition", "hover:shadow-xl");

                const dateElem = document.createElement("p");
                dateElem.classList.add("text-sm", "font-semibold", "text-gray-700");
                dateElem.textContent = date;

                const priceElem = document.createElement("p");
                priceElem.classList.add("text-lg", "font-bold", "text-blue-600");
                priceElem.textContent = `$${price.toFixed(2)}`;

                card.appendChild(dateElem);
                card.appendChild(priceElem);
                predictedPricesList.appendChild(card);

                // Store the data for the chart
                chartData.labels.push(date);
                chartData.prices.push(price);
            });
        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = error.message; // Display error message in the error section
            errorMessage.classList.remove("hidden"); // Show the error message
            loadingSpinner.classList.add("hidden");  // Hide spinner on error too
        }
    });

    // Event listener for "Generate Visual" button
    generateVisualButton.addEventListener("click", () => {
        if (chartData.labels.length === 0 || chartData.prices.length === 0) {
            alert("Please submit the form first to generate predictions.");
            return;
        }

        // Show the chart canvas
        stockPriceChartCanvas.classList.remove("hidden");

        // Generate the chart
        generateVisual(chartData.labels, chartData.prices);
    });

    // Function to generate the visual chart (line plot)
    function generateVisual(labels, prices) {
        const ctx = stockPriceChartCanvas.getContext('2d');

        // Create the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // X-axis labels (dates)
                datasets: [{
                    label: 'Predicted Stock Price',
                    data: prices,  // Y-axis data (prices)
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

});
