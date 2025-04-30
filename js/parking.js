// Initialize map
let map = L.map('map').setView([39.8283, -98.5795], 4); // Center of US

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Store markers
let markers = [];

// Pagination variables
let currentPage = 0;
let itemsPerPage = 10;
let currentData = [];

// City data configurations
const cityConfigs = {
  seattle: {
    name: 'Seattle, WA',
    center: [47.6062, -122.3321],
    zoom: 13,
    apiUrl: 'https://data.seattle.gov/resource/qtea-9c5v.json?$limit=100',
    mapFunction: mapSeattleData
  },
  newyork: {
    name: 'New York, NY',
    center: [40.7128, -74.0060],
    zoom: 12,
    apiUrl: 'https://data.cityofnewyork.us/resource/7cgt-uhhz.json?$limit=100',
    mapFunction: mapNYCData
  },
  sanfrancisco: {
    name: 'San Francisco, CA',
    center: [37.7749, -122.4194],
    zoom: 13,
    apiUrl: 'https://data.sfgov.org/resource/mizu-nf6z.json?$limit=100',
    mapFunction: mapSFData
  },
  dc: {
    name: 'Washington, DC',
    center: [38.9072, -77.0369],
    zoom: 13,
    apiUrl: 'https://opendata.arcgis.com/datasets/dc3dc5310f1f4be7a1fa6cde59b564df_62.geojson',
    mapFunction: mapDCData
  },
  austin: {
    name: 'Austin, TX',
    center: [30.2672, -97.7431],
    zoom: 13,
    apiUrl: 'https://data.austintexas.gov/resource/ij6a-fwpi.json?$limit=100',
    mapFunction: mapAustinData
  }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('search-btn');
  const citySelect = document.getElementById('city-select');
  const prevPageBtn = document.createElement('button');
  const nextPageBtn = document.createElement('button');
  const paginationDiv = document.createElement('div');
  const paginationInfo = document.createElement('span');
  
  prevPageBtn.textContent = 'Previous';
  nextPageBtn.textContent = 'Next';
  paginationDiv.className = 'pagination-controls';
  
  paginationDiv.appendChild(prevPageBtn);
  paginationDiv.appendChild(paginationInfo);
  paginationDiv.appendChild(nextPageBtn);
  
  const resultsContainer = document.getElementById('parking-results');
  resultsContainer.parentNode.insertBefore(paginationDiv, resultsContainer.nextSibling);
  
  prevPageBtn.addEventListener('click', function() {
    if (currentPage > 0) {
      currentPage--;
      renderCurrentPage();
    }
  });
  
  nextPageBtn.addEventListener('click', function() {
    if ((currentPage + 1) * itemsPerPage < currentData.length) {
      currentPage++;
      renderCurrentPage();
    }
  });
  
  searchBtn.addEventListener('click', function() {
    const selectedCity = citySelect.value;
    if (selectedCity) {
      currentPage = 0;
      fetchParkingData(selectedCity);
    }
  });
  
  function renderCurrentPage() {
    // Clear existing markers
    clearMarkers();
    
    // Get current page items
    const start = currentPage * itemsPerPage;
    const end = Math.min(start + itemsPerPage, currentData.length);
    const pageItems = currentData.slice(start, end);
    
    // Update pagination info
    paginationInfo.textContent = `Showing ${start + 1}-${end} of ${currentData.length}`;
    
    // Show/hide pagination buttons
    prevPageBtn.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
    nextPageBtn.style.visibility = end < currentData.length ? 'visible' : 'hidden';
    
    // Process the current city's data
    const currentCity = citySelect.value;
    if (currentCity && cityConfigs[currentCity]) {
      cityConfigs[currentCity].mapFunction(pageItems, true);
    }
  }
});

// Fetch parking data
function fetchParkingData(city) {
  const cityConfig = cityConfigs[city];
  
  if (!cityConfig) {
    showError('City configuration not found');
    return;
  }
  
  // Update map view
  map.setView(cityConfig.center, cityConfig.zoom);
  
  // Show loading indicator
  document.getElementById('parking-results').innerHTML = '<p class="loading">Loading parking data</p>';
  
  // Clear existing markers
  clearMarkers();
  
  // Fetch data
  fetch(cityConfig.apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Store the data for pagination
      currentData = data;
      if (city === 'dc' && data.features) {
        currentData = data.features;
      }
      
      // Get current page items
      const start = currentPage * itemsPerPage;
      const end = Math.min(start + itemsPerPage, currentData.length);
      const pageItems = currentData.slice(start, end);
      
      // Update pagination info
      const paginationInfo = document.querySelector('.pagination-controls span');
      if (paginationInfo) {
        paginationInfo.textContent = `Showing ${start + 1}-${end} of ${currentData.length}`;
      }
      
      // Show/hide pagination buttons
      const prevPageBtn = document.querySelector('.pagination-controls button:first-child');
      const nextPageBtn = document.querySelector('.pagination-controls button:last-child');
      
      if (prevPageBtn && nextPageBtn) {
        prevPageBtn.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        nextPageBtn.style.visibility = end < currentData.length ? 'visible' : 'hidden';
      }
      
      cityConfig.mapFunction(pageItems, false);
    })
    .catch(error => {
      console.error('Error fetching parking data:', error);
      showError('Failed to load parking data. Please try again later.');
    });
}

// Map data for each city
function mapSeattleData(data, isPaginated) {
  const parkingList = document.getElementById('parking-results');
  
  if (!data || data.length === 0) {
    parkingList.innerHTML = '<p class="info-text">No parking lots found</p>';
    return;
  }
  
  let parkingHTML = '';
  
  data.forEach(lot => {
    if (lot.latitude && lot.longitude) {
      // Add marker to map
      const marker = L.marker([parseFloat(lot.latitude), parseFloat(lot.longitude)])
        .addTo(map)
        .bindPopup(`<strong>${lot.parkingname || 'Parking Lot'}</strong><br>${lot.address || ''}`);
      
      markers.push(marker);
      
      // Add to list
      parkingHTML += `
        <div class="parking-item">
          <h3>${lot.parkingname || 'Parking Lot'}</h3>
          <p>${lot.address || 'No address provided'}</p>
          <div class="details">
            <p>Type: ${lot.parkingtype || 'Not specified'}</p>
            <p>Spaces: ${lot.parkingspaces || 'Unknown'}</p>
          </div>
        </div>
      `;
    }
  });
  
  parkingList.innerHTML = parkingHTML || '<p class="info-text">No parking lots found</p>';
}

function mapNYCData(data, isPaginated) {
  const parkingList = document.getElementById('parking-results');
  
  if (!data || data.length === 0) {
    parkingList.innerHTML = '<p class="info-text">No parking lots found</p>';
    return;
  }
  
  let parkingHTML = '';
  
  data.forEach(lot => {
    // Handle different geometry formats
    let latitude = null;
    let longitude = null;
    
    if (lot.the_geom) {
      if (lot.the_geom.type === 'Point' && Array.isArray(lot.the_geom.coordinates)) {
        // Point format
        longitude = lot.the_geom.coordinates[0];
        latitude = lot.the_geom.coordinates[1];
      } else if (lot.the_geom.type === 'MultiPolygon' && Array.isArray(lot.the_geom.coordinates) && 
                lot.the_geom.coordinates.length > 0 && Array.isArray(lot.the_geom.coordinates[0])) {
        // MultiPolygon format - use first point of first polygon
        longitude = lot.the_geom.coordinates[0][0][0][0];
        latitude = lot.the_geom.coordinates[0][0][0][1];
      } else if (lot.the_geom.type === 'Polygon' && Array.isArray(lot.the_geom.coordinates) && 
                lot.the_geom.coordinates.length > 0) {
        // Polygon format
        longitude = lot.the_geom.coordinates[0][0][0];
        latitude = lot.the_geom.coordinates[0][0][1];
      }
    } else if (lot.longitude && lot.latitude) {
      // Direct coordinates
      longitude = parseFloat(lot.longitude);
      latitude = parseFloat(lot.latitude);
    }
    
    if (latitude && longitude) {
      // Add marker to map
      const marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>Parking Lot</strong><br>${lot.borough || ''}`);
      
      markers.push(marker);
      
      // Add to list
      parkingHTML += `
        <div class="parking-item">
          <h3>Parking Lot</h3>
          <p>Location: ${lot.borough || 'No description provided'}</p>
        </div>
      `;
    }
  });
  
  parkingList.innerHTML = parkingHTML || '<p class="info-text">No parking lots found</p>';
}

function mapSFData(data, isPaginated) {
  const parkingList = document.getElementById('parking-results');
  
  if (!data || data.length === 0) {
    parkingList.innerHTML = '<p class="info-text">No parking lots found</p>';
    return;
  }
  
  let parkingHTML = '';
  
  data.forEach(lot => {
    if (lot.location && lot.location.coordinates) {
      const longitude = lot.location.coordinates[0];
      const latitude = lot.location.coordinates[1];
      
      // Add marker to map
      const marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>${lot.facname || 'Parking Lot'}</strong><br>${lot.location_name || ''}`);
      
      markers.push(marker);
      
      // Add to list
      parkingHTML += `
        <div class="parking-item">
          <h3>${lot.facname || 'Parking Lot'}</h3>
          <p>${lot.location_name || 'No location name provided'}</p>
          <div class="details">
            <p>Type: ${lot.factype || 'Not specified'}</p>
          </div>
        </div>
      `;
    }
  });
  
  parkingList.innerHTML = parkingHTML || '<p class="info-text">No parking lots found</p>';
}

function mapDCData(data, isPaginated) {
  const parkingList = document.getElementById('parking-results');
  
  if (!data || data.length === 0) {
    parkingList.innerHTML = '<p class="info-text">No parking lots found</p>';
    return;
  }
  
  let parkingHTML = '';
  
  data.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      const coordinates = feature.geometry.coordinates;
      const props = feature.properties;
      
      // For polygons, use the first coordinate as the marker
      let longitude, latitude;
      
      if (feature.geometry.type === 'Polygon') {
        longitude = coordinates[0][0][0];
        latitude = coordinates[0][0][1];
      } else if (feature.geometry.type === 'Point') {
        longitude = coordinates[0];
        latitude = coordinates[1];
      }
      
      if (longitude && latitude) {
        // Add marker to map
        const marker = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(`<strong>Parking Lot/Area</strong>`);
        
        markers.push(marker);
        
        // Add to list
        parkingHTML += `
          <div class="parking-item">
            <h3>Parking Lot/Area</h3>
            <p>Type: ${props.OBJECTID || 'No description provided'}</p>
          </div>
        `;
      }
    }
  });
  
  parkingList.innerHTML = parkingHTML || '<p class="info-text">No parking lots found</p>';
}

function mapAustinData(data, isPaginated) {
  const parkingList = document.getElementById('parking-results');
  
  if (!data || data.length === 0) {
    parkingList.innerHTML = '<p class="info-text">No parking lots found</p>';
    return;
  }
  
  let parkingHTML = '';
  
  data.forEach(lot => {
    if (lot.latitude && lot.longitude) {
      // Add marker to map
      const marker = L.marker([parseFloat(lot.latitude), parseFloat(lot.longitude)])
        .addTo(map)
        .bindPopup(`<strong>${lot.name || 'Parking Lot'}</strong><br>${lot.address || ''}`);
      
      markers.push(marker);
      
      // Add to list
      parkingHTML += `
        <div class="parking-item">
          <h3>${lot.name || 'Parking Lot'}</h3>
          <p>${lot.address || 'No address provided'}</p>
          <div class="details">
            <p>Type: ${lot.type || 'Not specified'}</p>
          </div>
        </div>
      `;
    }
  });
  
  parkingList.innerHTML = parkingHTML || '<p class="info-text">No parking lots found</p>';
}

// Helper functions
function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

function showError(message) {
  document.getElementById('parking-results').innerHTML = `<p class="info-text">${message}</p>`;
} 