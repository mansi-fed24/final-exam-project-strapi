//  Function to Display the To Read List
    async function displayToReadList(sortBy = "title") {
    const token = sessionStorage.getItem("token");
    const toReadListContainer = document.getElementById("to-read-list");
    toReadListContainer.innerHTML = "";

    if (!token) {
        console.log("User is not logged in.");
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/users/me?populate=toReads`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const user = response.data;
        console.log("User Data with To Read List:", user);

        const toReadList = user.toReads || [];
        
        if (toReadList.length === 0) {
            toReadListContainer.innerHTML = "<p>Your To Read list is empty.</p>";
            return;
        }

        // Sort the To Read List
        toReadList.sort((a, b) => {
            if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            } else if (sortBy === "author") {
                return a.author.localeCompare(b.author);
            }
        });

        // display sorted list
        toReadList.forEach(book => {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-item");

            bookItem.innerHTML = `
                
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Pages: ${book.pages}</p>
                <p>Release Date: ${book.release_date}</p>
                                
                <button onclick="removeFromToRead(${book.id})">Remove</button>
            `;

            toReadListContainer.appendChild(bookItem);
        });

        

    } catch (err) {
        console.log("Error fetching To Read list:", err);
        toReadListContainer.innerHTML = "<p>Error loading To Read list. Please try again later.</p>";
    }
}

//  Event Listener for Sorting To Read List
document.getElementById("to-read-sort").addEventListener("change", function() {
    const sortBy = this.value;
    displayToReadList(sortBy);
});

//  Function to Remove from To Read List
async function removeFromToRead(bookId) {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("You need to be logged in to remove books.");
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/users/me?populate=toReads`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        let user = response.data;
        let currentToReads = user.toReads ? user.toReads.map(book => book.id) : [];

        // Remove the book ID from the list
        currentToReads = currentToReads.filter(id => id !== bookId);

        // Update the toReads list
        await axios.put(`${BASE_URL}/api/users/${user.id}`, {
            toReads: currentToReads,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        alert("Book removed from To Read list.");
        displayToReadList(); // Refresh the list

    } catch (err) {
        console.log("Error removing from To Read list:", err);
        alert("Error removing book from To Read list.");
    }
}

// Function to Display User's Rated Books
async function displayRatedBooks(sortBy = "rating") {
    const token = sessionStorage.getItem("token");
    const ratedBooksContainer = document.getElementById("rated-books-list");
    ratedBooksContainer.innerHTML = "";

    if (!token) {
        ratedBooksContainer.innerHTML = "<p>You need to be logged in to view your rated books.</p>";
        return;
    }

    try {
         // Fetch the user data including ratings
        const response = await axios.get(`${BASE_URL}/api/users/me?populate=ratings`, {
            headers: { Authorization: `Bearer ${token}` },
        });

         console.log("Rated books response:", response.data); // Log the entire response

        const user = response.data;
        const ratedBooks = user.ratings || [];
        console.log("Rated books:", ratedBooks); // Log the rated books
        

        if (ratedBooks.length === 0) {
            ratedBooksContainer.innerHTML = "<p>You have not rated any books yet.</p>";
            return;
        }

         // Clear the container before rendering to avoid duplicates
        ratedBooksContainer.innerHTML = "";

        // Sort the rated books
        ratedBooks.sort((a, b) => {
            if (sortBy === "rating") {
                return b.rating - a.rating; // Sort by rating in descending order
            } else if (sortBy === "title") {
                return a.book.title.localeCompare(b.book.title); // Sort by title
            } else if (sortBy === "author") {
                return a.bookAuthor.localeCompare(b.bookAuthor);
            }
        });

        // Loop through rated books and display them
        ratedBooks.forEach(rating => {
            const book = rating.book || {}; // Adjust this based on your API response structure
            console.log("Book data:", book); // Log the book data
            // Check if book data is available      
            
               if (book ) {
                const bookItem = document.createElement("div");
                bookItem.classList.add("book-item");

                // Construct Book HTML
                bookItem.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Your Rating: ${rating.rating}</p>
                `;

                ratedBooksContainer.appendChild(bookItem);
             } else {
                console.warn("No book associated with this rating:", rating);
            }
        });
    } catch (err) {
        console.log("Error fetching rated books:", err);
        ratedBooksContainer.innerHTML = "<p>Error loading rated books. Please try again later.</p>";
    }
}

// Call functions on page load
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    
    displayRatedBooks(); // Load rated books
});


// Sort To Read List
function sortToReadList() {
    const sortOption = document.getElementById("to-read-sort").value;
    console.log("Sorting To Read List by:", sortOption);
    // Sorting logic will be implemented in the next step
}

// Sort Rated Books
function sortRatedBooks() {
    const sortOption = document.getElementById("rated-sort").value;
    console.log("Sorting Rated Books by:", sortOption);
    // Sorting logic will be implemented in the next step
}