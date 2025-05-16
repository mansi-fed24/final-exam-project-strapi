console.log("Profile JS loaded");

const BASE_URL = "http://localhost:1337";

// Function to Navigate to Home Page
function showHome() {
    window.location.href = "index.html";
}

//  Function to Navigate to Profile Page
function showProfile() {
    window.location.href = "profile.html";
}

//  Function to Handle Logout
function handleLogout() {
    sessionStorage.removeItem("token");
    window.location.href = "index.html";  // Redirect to home after logout
}

function updateNavbar() {
    const token = sessionStorage.getItem("token");
    const navLinks = document.getElementById("nav-links");

    if (token) {
        navLinks.innerHTML = `
            <button onclick="showHome()">Home</button>
            <button onclick="showProfile()">Profile</button>
            <button onclick="handleLogout()">Logout</button>
        `;
    } else {
        navLinks.innerHTML = `
            <button onclick="showLogin()">Login</button>
            <button onclick="showRegister()">Register</button>
        `;
    }
}

//  Initialize on Page Load
document.addEventListener("DOMContentLoaded", updateNavbar);


// Function to Check and Display User Info
async function checkUserLogin() {
    const navLinks = document.getElementById("nav-links");
    const token = sessionStorage.getItem("token");

    if (token) {
        try {
            let response = await axios.get(`${BASE_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const user = response.data;
            console.log("Logged in user:", user);

            // Update Navbar
            navLinks.innerHTML = `
                <span class="highlighted-text">Welcome, ${user.username}</span>
                <button onclick="showHome()">Home</button>
                <button onclick="showProfile()">Profile</button> <!-- Add Profile Button -->
                <button onclick="handleLogout()">Logout</button>
            `;

        } catch (err) {
            console.log("Error fetching user info:", err);
        }
    } else {
        // If not logged in, show Login/Register buttons
        navLinks.innerHTML = `
            <button onclick="showLogin()">Login</button>
            <button onclick="showRegister()">Register</button>
        `;
    }
}


//  Function to Display All Books
async function displayBooks() {
    const token = sessionStorage.getItem("token");
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";  // Clear previous content
    

    try {
        const response = await axios.get(`${BASE_URL}/api/books?populate=*`);
        const books = response.data.data;
        
        console.log("Books:", books);

        if (books.length === 0) {
            bookList.innerHTML = "<p>No books available at the moment.</p>";
            return;
        }

        books.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");
            const bookData = book.attributes || book;  // Adjust for structure


            // Calculate Average Rating
            const bookRatings = bookData.ratings || [];
            let averageRating = "Not Rated";
            
             if (bookRatings.length > 0) {
                // Filter out invalid ratings and calculate the average
                const validRatings = bookRatings.filter(rating => typeof rating.rating === "number");
                if (validRatings.length > 0) {
                    const totalRatings = validRatings.reduce((acc, rating) => acc + rating.rating, 0);
                    averageRating = (totalRatings / validRatings.length).toFixed(1);
                }
            }

            // build HTML with or without "To Read" and rating button
            let extraButtons = "";
            if (token) {
                extraButtons = `
                    <button onclick="addToRead('${book.id}')">Add To Read</button>
                    <button onclick="showRatingForm('${book.id}')">Rate</button>
                `;
            }

            // Construct Book HTML
            bookItem.innerHTML = `
                <h3>${bookData.title}</h3>
                <p>Author: ${bookData.author}</p>
                <p>Pages: ${bookData.pages}</p>
                <p>Release Date: ${bookData.release_date}</p>
                <p>Average Rating: ${averageRating}</p>
                <img src="${BASE_URL}${bookData.cover_image.url}" width="100" alt="${bookData.title}" />
                 ${extraButtons}
                <div id="rating-form-container-${book.id}" style="display:none;">
                                       
                </div>
            `;

            bookList.appendChild(bookItem);
        });

    } catch (err) {
        console.log("Error fetching books:", err);
        bookList.innerHTML = "<p>Error loading books. Please try again later.</p>";
    }
}


//  Function to Add a Book to "To Read" List
async function addToRead(bookId) {
    console.log(`Attempting to add book ID ${bookId} to To Read list`);

    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to add a book to your To Read list.");
        return;
    }

    try {
        // Get the logged-in user data including the current toReads list
        const userResponse = await axios.get(`${BASE_URL}/api/users/me?populate=toReads`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = userResponse.data;
        console.log("Logged in user:", user);

       
        
        const userId = user.id;
        const currentToReads = user.toReads ? user.toReads.map(book => book.id) : []; // Extract book IDs from the toReads list

         // Check if the book is already in the toReads list to avoid duplicates
         if (!currentToReads.includes(bookId)) {
            currentToReads.push(bookId);
        } else {
            alert("Book already in your To Read list.");
            return;
        }

        // Add the new book ID to the existing toReads list
        const toReadList = user.toReads || [];
        // Check if the book is already in the list
        console.log("Current To Read list:", toReadList);
        const updatedToReadList = [...toReadList, bookId];

        // Send a PUT request to update the user's toReads list
        const response = await axios.put(`${BASE_URL}/api/users/${user.id}`, {
            toReads: currentToReads
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Updated To Read list:", response.data);
        alert("Book added to To Read list successfully!");

    } catch (err) {
        console.log("Error adding to To Read list:", err);
        alert("Error adding book to To Read list");
    }
};

//  Function to Show Rating Form
function showRatingForm(bookId) {   
    const ratingFormContainer = document.getElementById(`rating-form-container-${bookId}`);
    const ratingForm = `
        <form id="rating-form-${bookId}" onsubmit="submitRating(event, '${bookId}')">
            <label for="rating">Rate this book (1-10):</label>
            <select id="rating-${bookId}" name="rating" required>
                        <option value="">Select Rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>

            </select>
            <button onclick="submitRating('${bookId}')">Submit Rating</button>
        </form>
    `;
    ratingFormContainer.innerHTML = ratingForm;
    ratingFormContainer.style.display = "block"; // Show the form
}



// Function to Submit Rating for a Book
async function submitRating(bookId) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to rate books.");
        return;
    }

    const ratingSelect = document.getElementById(`rating-${bookId}`);
    const ratingValue = ratingSelect.value;

    if (!ratingValue) {
        alert("Please select a rating before submitting.");
        return;
    }

     try {
        // Fetch user data to get the user ID
        const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const user = userResponse.data;
        const userId = user.id;
        console.log("User ID:", userId);

        console.log("Submitting rating:", ratingValue, "for book ID:", bookId, "by user ID:", userId);
        
        const response = await axios.post(
            `${BASE_URL}/api/ratings`,
            {
                data: {
                    rating: parseInt(ratingValue),
                    book: bookId,
                    users_permissions_user: userId // Associate the user with the rating
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Rating submitted:", response.data);
        alert("Rating submitted successfully!");

        // Optionally, refresh the book list to update the average rating
        displayBooks();
        
            

    } catch (err) {
        console.log("Error submitting rating:", err);
        alert("Error submitting rating. Please try again.");
    }
}


// Function to Show Login Form
function showLogin() {
    document.getElementById('auth-modal').style.display = 'flex'; // Show modal
    document.getElementById('login-form').style.display = 'block'; // Show login form
    document.getElementById('register-form').style.display = 'none'; // Hide register form
}

function showRegister() {
    document.getElementById('auth-modal').style.display = 'flex'; // Show modal
    document.getElementById('login-form').style.display = 'none'; // Hide login form
    document.getElementById('register-form').style.display = 'block'; // Show register form
}

function closeModal() {
    document.getElementById('auth-modal').style.display = 'none'; // Hide modal
}


//  Function to Handle Login
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        let response = await axios.post(`${BASE_URL}/api/auth/local`, {
            identifier: email,
            password: password
        });

        if (response.status === 200) {
            sessionStorage.setItem("token", response.data.jwt);
            alert("Login successful!");
            closeModal(); // Close modal
            checkUserLogin(); // Update navbar
            displayToReadList();  // Fetch the To Read list after login
            location.reload();
        }
    } catch (err) {
        console.log("Login Error:", err);
        alert("Login failed: " + err.response.data.error.message);
    }
}

//  Function to Handle Registration
async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        let response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
            username: username,
            email: email,
            password: password
        });

        alert("Registration successful! You can now log in.");
        showLogin();

    } catch (err) {
        console.log("Registration Error:", err);
        alert("Registration failed: " + err.response.data.error.message);
    }
}

//  Execute displayBooks() on Page Load
//document.addEventListener("DOMContentLoaded", displayBooks);

document.addEventListener("DOMContentLoaded", () => {
    displayBooks();
    checkUserLogin();  // Check user login status on page load
});

 