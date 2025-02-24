document.addEventListener('DOMContentLoaded', () => {
    const vehicleCards = document.getElementById('vehicleCards');
    const rideNowBtn = document.getElementById('ride-now-btn');
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    const vehicleType = document.getElementById('vehicle-type');

    fetchVehicles();


     // Add event listener to the search button
  rideNowBtn.addEventListener('click', () => {
    const filters = {
      vehicleType: vehicleType.value,
      startTime: startTime.value,
      endTime: endTime.value,
    };
    fetchVehicles(filters);
  });

  // Function to fetch vehicles with optional filters
  function fetchVehicles(filters = {}) {
    fetch('http://localhost:3000/api/vehicles/approved')
      .then((response) => response.json())
      .then((vehicles) => {
        const filteredVehicles = filterVehicles(vehicles, filters);
        renderCards(filteredVehicles);
      })
      .catch((error) => console.error('Error fetching vehicles:', error));
  }

  // Function to filter vehicles based on selected criteria
  function filterVehicles(vehicles, filters) {
    return vehicles.filter((vehicle) => {
      const { vehicleType, startTime, endTime } = filters;

      // Filter by vehicle type if selected
      if (vehicleType && vehicle.vehicleType !== vehicleType) return false;

      // Filter by time slot if both times are provided
      if (startTime && endTime) {
        const vehicleStart = vehicle.startTime || '00:00';
        const vehicleEnd = vehicle.endTime || '23:59';
        return (
          vehicleStart <= startTime &&
          vehicleEnd >= endTime
        );
      }

      return true; // Return all vehicles if no filters are applied
    });
  }

  
    // Fetch only approved vehicles
  fetch('http://localhost:3000/api/vehicles/approved')
      .then(response => response.json())
    //   .then(data => renderCards(data))
    .then((vehicles) => {
        console.log('Fetched Vehicles:', vehicles); // Add this line
        renderCards(vehicles);
    })
      .catch(error => console.error('Error fetching vehicles:', error));
  
    function renderCards(vehicles) {
      vehicleCards.innerHTML = ''; // Clear cards
      vehicles.forEach(vehicle => {
        const card = document.createElement('div');
      card.classList.add(
        'bg-white', 
        'shadow-lg', 
        'rounded-lg', 
        'overflow-hidden',
        'w-full',
        'max-w-sm',
        'mt-10',
        'mx-auto'
      );

      const vehicleImage = vehicle.vehicleImages.length
        ? vehicle.vehicleImages[0]
        : 'default-image.jpg'; // Use a placeholder image if no images available

      card.innerHTML = `
        <img src="${vehicleImage}" alt="${vehicle.vehicleName}" class="w-full h-48 object-cover"/>
        <div class="p-3">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-xl font-bold">${vehicle.vehicleName}</h2>
            <span class="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">${vehicle.fuelType}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
          <h2 class="text-sm text-gray-500 mb-4 font-semibold">Pickup: ${vehicle.pickupAddress}</h2>
          <span class="text-lg text-gray-800 mb-1 px-2 py-1 rounded">Price: ₹${vehicle.price || 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <button class="more-details-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              More Details
            </button>
            <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
              Book Now
            </button>
          </div>
        </div>
      `;
      card.querySelector('.more-details-btn').addEventListener('click', () => {
        const queryParams = new URLSearchParams({
          vehicleName: vehicle.vehicleName,
          fuelType: vehicle.fuelType,
          pickupAddress: vehicle.pickupAddress,
          areaPinCode: vehicle.areaPinCode,
          phoneNo: vehicle.phoneNo,
          price: vehicle.price,
          vehicleImages: vehicle.vehicleImages.join(',') // Convert array to string if it's an array
        }).toString();
    
        window.location.href = `moredetails.html?${queryParams}`;
    });
      
      vehicleCards.appendChild(card);
    });
    }
  });
  