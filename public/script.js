function createModalsFields(movies) {
    const container = document.getElementById('movies-container');

    movies.forEach((movie, index) => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.id = movie.title;
        card.style.backgroundImage = `url(${movie.poster})`;
        card.addEventListener('click', () => openModal(movie));


        container.appendChild(card);
    });
}


function openModal(movie) {
    const modal = document.getElementById('movie-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalPlot = document.getElementById('modal-plot');
    const modalGenres = document.getElementById('modal-genres');
    const modalRuntime = document.getElementById('modal-runtime');
    const modalCast = document.getElementById('modal-cast');
    const modalLanguage = document.getElementById('modal-language');
    const modalReleased = document.getElementById('modal-released');
    const modalDirectors = document.getElementById('modal-directors');
    const modalWriters = document.getElementById('modal-writers');
    const modalYear = document.getElementById('modal-year');
    const modalIMDB = document.getElementById('modal-imdb');
    const modalTomatoes = document.getElementById('modal-Tomatoes');
    const modalComments = document.getElementById('modal-Comments');

    // Set movie data
    modalTitle.textContent = `Title: ${movie.title || 'N/A'}`;
    modalPlot.textContent = `Plot: ${movie.fullplot || movie.plot || 'N/A'}`;
    modalGenres.textContent = `Genres: ${movie.genres?.join(', ') || 'N/A'}`;
    modalRuntime.textContent = `Runtime: ${movie.runtime ? movie.runtime + ' min' : 'N/A'}`;
    modalCast.textContent = `Cast: ${movie.cast?.join(', ') || 'N/A'}`;
    modalLanguage.textContent = `Language: ${movie.languages?.join(', ') || 'N/A'}`;
    modalReleased.textContent = `Released: ${movie.released ? new Date(movie.released).toDateString() : 'N/A'}`;
    modalDirectors.textContent = `Directors: ${movie.directors?.join(', ') || 'N/A'}`;
    modalWriters.textContent = `Writers: ${movie.writers?.join(', ') || 'N/A'}`;
    modalYear.textContent = `Year: ${movie.year || 'N/A'}`;
    modalIMDB.textContent = `IMDB: ${movie.imdb?.rating || 'N/A'} (${movie.imdb?.votes || 0} votes)`;
    modalTomatoes.textContent = `Tomatoes: ${movie.tomatoes?.viewer?.rating || 'N/A'} (${movie.tomatoes?.viewer?.numReviews || 0} reviews)`;

    modalComments.innerHTML = `
        <h2>Comments</h2>
        <div id="comments-list"></div>
        <div class="comment-input">
            <input type="text" id="new-comment-input" placeholder="Write a comment..." />
            <button id="submit-comment">Post</button>
        </div>
    `;

    const commentsList = document.getElementById('comments-list');

    GetComments(movie._id).then(comments => {
        if (!comments.length) {
            commentsList.innerHTML = `<p>No comments yet.</p>`;
            return;
        }

        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.classList.add('comment-box');
            commentEl.innerHTML = `
                <div class="comment-avatar"></div>
                <div class="comment-content">
                    <span class="comment-name">${comment.name}</span>
                    <span class="comment-text" data-id="${comment._id.$oid}">${comment.text}</span>
                    <button class="edit-comment" data-id="${comment._id}">Edit</button>
                    <button class="delete-comment" data-id="${comment._id}">Delete</button>
                </div>
            `;
            commentsList.appendChild(commentEl);
        });

        // Edit functionality
        document.querySelectorAll('.edit-comment').forEach(button => {
            button.addEventListener('click', async () => {
                const commentId = button.dataset.id;
                const newText = prompt('Edit your comment:');
                if (!newText) return;
                console.log('Updating comment with ID:', commentId);

                const response = await fetch(`http://localhost:3006/Comments/update/${commentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({text: newText })
                });

                if (response.ok) {
                    openModal(movie);
                } else {
                    alert('Failed to update comment.');
                }
            });
        });

        document.querySelectorAll('.delete-comment').forEach(button => {
            button.addEventListener('click', async () => {
                const commentId = button.dataset.id;

                if (!confirm('Are you sure you want to delete this comment?')) return;

                const response = await fetch(`http://localhost:3006/Comments/delete/${commentId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    openModal(movie);
                } else {
                    alert('Failed to delete comment.');
                }
            });
        });
    });

    document.getElementById('submit-comment').addEventListener('click', async () => {
        const input = document.getElementById('new-comment-input');
        const text = input.value.trim();
        if (!text) return;

        const newComment = {
            name: "Anonymous",
            email: "anonymous@example.com",
            movie_id: movie._id,
            text
        };

        try {
            const response = await fetch('http://localhost:3006/Comments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });

            if (response.ok) {
                input.value = '';
                openModal(movie);
            } else {
                const data = await response.json();
                alert('Failed to add comment: ' + data.error);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Server error');
        }
    });

    // Show the modal
    modal.style.display = 'block';
}



function GetLivros() {
    fetch('http://localhost:3006/movies')
        .then(response => response.json())
        .then(data => {
            createModalsFields(data);
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            alert('Error fetching movies. Check console for details.');
        });
}

function GetComments(id) {
    return fetch(`http://localhost:3006/Comments/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching Comments:', error);
            alert('Error fetching comments. Check console for details.');
            return [];
        });
}


function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.style.display = 'none';
}

window.onload = GetLivros;
