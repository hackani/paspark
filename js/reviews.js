// Sample parking locations from our custom names list
const parkingLocations = [
  "Central City Parking",
  "Downtown Plaza Parking",
  "Riverfront Parking Garage",
  "Heritage Square Parking",
  "Westside Mall Parking",
  "City Center Garage",
  "Eastside Public Parking",
  "Metro Park & Ride",
  "Sunset Boulevard Parking",
  "Convention Center Garage",
  "Union Station Parking",
  "Midtown Plaza Parking",
  "Harbor View Parking",
  "Civic Center Parking",
  "Stadium Garage"
];

// Dummy reviews
const dummyReviews = [
  {
    id: 1,
    parkingName: "Central City Parking",
    reviewerName: "John Smith",
    rating: 4,
    reviewText: "Great location and easy to find. The payment system was straightforward and the staff was helpful. Would use this parking lot again.",
    date: "2023-09-15"
  },
  {
    id: 2,
    parkingName: "Downtown Plaza Parking",
    reviewerName: "Emily Johnson",
    rating: 5,
    reviewText: "Perfect downtown parking option! Very clean and well-maintained. The security was visible and I felt safe leaving my car here overnight.",
    date: "2023-10-02"
  },
  {
    id: 3,
    parkingName: "Riverfront Parking Garage",
    reviewerName: "Michael Brown",
    rating: 3,
    reviewText: "Average parking experience. Spaces are a bit tight and it gets full quickly during peak hours. The location is convenient though.",
    date: "2023-10-12"
  },
  {
    id: 4,
    parkingName: "Metro Park & Ride",
    reviewerName: "Sarah Wilson",
    rating: 2,
    reviewText: "Disappointed with this parking lot. Poor lighting and the payment machine was out of order. Had to walk quite far to my destination.",
    date: "2023-10-18"
  },
  {
    id: 5,
    parkingName: "Convention Center Garage",
    reviewerName: "David Lee",
    rating: 5,
    reviewText: "Excellent parking facility! Spacious spots and very convenient for attending events at the convention center. Will definitely park here again.",
    date: "2023-10-25"
  }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Populate parking locations dropdown
  populateParkingLocations();
  
  // Load and display reviews
  loadReviews();
  
  // Set up form submission event
  document.getElementById('review-form').addEventListener('submit', handleReviewSubmission);
});

// Populate the parking locations dropdown
function populateParkingLocations() {
  const parkingSelect = document.getElementById('parking-name');
  
  parkingLocations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    parkingSelect.appendChild(option);
  });
}

// Load reviews from localStorage and combine with dummy reviews
function loadReviews() {
  let reviews = [...dummyReviews]; // Start with dummy reviews
  
  // Get user reviews from localStorage
  const userReviews = JSON.parse(localStorage.getItem('parkingReviews')) || [];
  
  // Combine all reviews and sort by date (newest first)
  reviews = [...reviews, ...userReviews].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display the reviews
  displayReviews(reviews);
}

// Display reviews in the reviews list
function displayReviews(reviews) {
  const reviewsList = document.getElementById('reviews-list');
  reviewsList.innerHTML = ''; // Clear existing reviews
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p>No reviews yet. Be the first to leave a review!</p>';
    return;
  }
  
  reviews.forEach(review => {
    const reviewElement = createReviewElement(review);
    reviewsList.appendChild(reviewElement);
  });
}

// Create a review element
function createReviewElement(review) {
  const reviewDiv = document.createElement('div');
  reviewDiv.className = 'review';
  
  // Format the date
  const reviewDate = new Date(review.date);
  const formattedDate = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create rating stars
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  
  reviewDiv.innerHTML = `
    <div class="review-header">
      <span class="review-author">${review.reviewerName}</span>
      <span class="review-date">${formattedDate}</span>
    </div>
    <div class="review-location"><strong>${review.parkingName}</strong></div>
    <div class="review-rating">${stars}</div>
    <div class="review-content">${review.reviewText}</div>
  `;
  
  return reviewDiv;
}

// Handle review form submission
function handleReviewSubmission(e) {
  e.preventDefault();
  
  // Get form values
  const parkingName = document.getElementById('parking-name').value;
  const reviewerName = document.getElementById('reviewer-name').value;
  const rating = parseInt(document.getElementById('rating').value);
  const reviewText = document.getElementById('review-text').value;
  
  // Create new review object
  const newReview = {
    id: Date.now(), // Use timestamp as a unique ID
    parkingName,
    reviewerName,
    rating,
    reviewText,
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  };
  
  // Save to localStorage
  saveReview(newReview);
  
  // Reset form
  e.target.reset();
  
  // Reload reviews
  loadReviews();
  
  // Show confirmation
  alert('Thank you for your review!');
}

// Save a review to localStorage
function saveReview(review) {
  // Get existing reviews
  const existingReviews = JSON.parse(localStorage.getItem('parkingReviews')) || [];
  
  // Add new review
  existingReviews.push(review);
  
  // Save back to localStorage
  localStorage.setItem('parkingReviews', JSON.stringify(existingReviews));
} 