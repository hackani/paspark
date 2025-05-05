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
    reviewText: "This downtown parking garage is well-maintained and brightly lit, which made me feel secure even when returning to my car late at night. The payment system is modern and accepts contactless payments. The only downside is that spaces are somewhat tight for larger vehicles, but overall it's a reliable option in the heart of the city.",
    date: "2023-09-15"
  },
  {
    id: 2,
    parkingName: "Downtown Plaza Parking",
    reviewerName: "Emily Johnson",
    rating: 5,
    reviewText: "I can't recommend Downtown Plaza Parking enough! The attendants are professional and helpful, the facility is immaculately clean, and they have security personnel visible throughout. I particularly appreciate the well-marked pedestrian walkways and the covered connection to the main shopping center, which is perfect during bad weather. Worth every penny for the convenience and peace of mind.",
    date: "2023-10-02"
  },
  {
    id: 3,
    parkingName: "Riverfront Parking Garage",
    reviewerName: "Michael Brown",
    rating: 3,
    reviewText: "Riverfront has a fantastic location near all the waterfront attractions, which is its main selling point. However, the facility itself needs some updating. The payment machines were slow, and one was out of order during my visit. Spaces are adequate size but the layout is confusing - better signage would help. It gets very busy on weekends, so arrive early if you need a spot.",
    date: "2023-10-12"
  },
  {
    id: 4,
    parkingName: "Metro Park & Ride",
    reviewerName: "Sarah Wilson",
    rating: 2,
    reviewText: "I used this park and ride facility for a week while my regular garage was under renovation. The price is reasonable, but the conditions left much to be desired. Poor lighting in several sections made me uncomfortable when leaving work after dark. The shuttle service to downtown was inconsistent, sometimes making me late for work. Would only use again if absolutely necessary.",
    date: "2023-10-18"
  },
  {
    id: 5,
    parkingName: "Convention Center Garage",
    reviewerName: "David Lee",
    rating: 5,
    reviewText: "Perfect parking option for convention attendees! I was impressed by how efficiently they handled the large volume of cars during a major event. Despite being at capacity, entering and exiting was smooth thanks to their multiple entry/exit points and well-trained staff. The reserved section for pre-booked spaces worked flawlessly. The EV charging stations were a nice bonus for my Tesla.",
    date: "2023-10-25"
  },
  {
    id: 6,
    parkingName: "Eastside Public Parking",
    reviewerName: "Jennifer Martinez",
    rating: 4,
    reviewText: "Eastside Public Parking offers great value in an otherwise expensive part of town. I appreciate the hourly rates and the option to extend parking through their mobile app. The facility is well-maintained with wide spaces that accommodate SUVs comfortably. The location is convenient to restaurants and shops. Only reason for not giving 5 stars is the somewhat slow exit process during peak hours.",
    date: "2023-11-05"
  },
  {
    id: 7,
    parkingName: "Harbor View Parking",
    reviewerName: "Robert Johnson",
    rating: 3,
    reviewText: "Harbor View has an unbeatable location for waterfront events, but their pricing feels excessive, especially during special events when rates nearly double. The garage itself is clean and secure with good lighting. The automated payment system is efficient, but they should consider adding more machines to handle busy periods. Spaces are tight, making it challenging for larger vehicles.",
    date: "2023-11-15"
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