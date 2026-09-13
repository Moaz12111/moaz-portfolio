const SUPABASE_URL =
    "https://swhcdtdltgvqcosnpchh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7mrlGAeCupgqLS9EPq_Wjw_q7gbGPj4";


const client =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================
   ELEMENTS
========================= */

const workGrid =
    document.querySelector(".work-grid");

const commentForm =
    document.getElementById("commentForm");

const commentsList =
    document.getElementById("commentsList");

const commentName =
    document.getElementById("commentName");

const commentMessage =
    document.getElementById("commentMessage");

const commentSubmit =
    document.getElementById("commentSubmit");

const commentMessageBox =
    document.getElementById("commentMessageBox");


/* =========================
   FEEDBACK MESSAGE
========================= */

function showCommentMessage(message) {

    if (!commentMessageBox) {
        return;
    }

    commentMessageBox.textContent = message;

    commentMessageBox.classList.remove("hidden");
}


function hideCommentMessage() {

    if (!commentMessageBox) {
        return;
    }

    commentMessageBox.textContent = "";

    commentMessageBox.classList.add("hidden");
}


/* =========================
   STARS
========================= */

function createStars(rating) {

    const value =
        Number.isInteger(rating)
            ? rating
            : 0;

    return (
        "★".repeat(value) +
        "☆".repeat(5 - value)
    );
}


/* =========================
   DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =========================
   LOAD VIDEOS
========================= */

async function loadVideos() {

    if (!workGrid) {
        return;
    }

    workGrid.innerHTML =
        '<p class="loading-text">Loading videos...</p>';


    const {
        data,
        error
    } = await client
        .from("videos")
        .select(
            "id, title, description, file_url, created_at"
        )
        .eq("published", true)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading videos:",
            error
        );

        workGrid.innerHTML =
            '<p class="loading-text">Unable to load videos right now.</p>';

        return;
    }


    workGrid.innerHTML = "";


    if (!data || data.length === 0) {

        workGrid.innerHTML =
            '<p class="loading-text">No videos available yet.</p>';

        return;
    }


    data.forEach(function(video) {

        const card =
            document.createElement("div");

        card.className =
            "video-card";


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "video-wrapper";


        const videoElement =
            document.createElement("video");

        videoElement.controls = true;

        videoElement.playsInline = true;

        videoElement.preload = "metadata";


        const source =
            document.createElement("source");

        source.src =
            video.file_url;

        source.type =
            "video/mp4";


        videoElement.appendChild(source);

        wrapper.appendChild(videoElement);


        const info =
            document.createElement("div");

        info.className =
            "video-info";


        const title =
            document.createElement("h3");

        title.textContent =
            video.title;


        const description =
            document.createElement("p");

        description.textContent =
            video.description || "";


        info.appendChild(title);

        info.appendChild(description);


        card.appendChild(wrapper);

        card.appendChild(info);


        workGrid.appendChild(card);

    });

}


/* =========================
   LOAD APPROVED COMMENTS
========================= */

async function loadComments() {

    if (!commentsList) {
        return;
    }


    commentsList.innerHTML =
        '<p class="loading-text">Loading feedback...</p>';


    const {
        data,
        error
    } = await client
        .from("comments")
        .select(
            "id, name, message, rating, created_at"
        )
        .eq(
            "status",
            "approved"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading comments:",
            error
        );

        commentsList.innerHTML =
            '<p class="empty-comments">Unable to load feedback right now.</p>';

        return;
    }


    commentsList.innerHTML = "";


    if (!data || data.length === 0) {

        commentsList.innerHTML =
            '<p class="empty-comments">No feedback yet.</p>';

        return;
    }


    data.forEach(function(comment) {

        const card =
            document.createElement("div");

        card.className =
            "comment-card";


        const header =
            document.createElement("div");

        header.className =
            "comment-header";


        const name =
            document.createElement("div");

        name.className =
            "comment-name";

        name.textContent =
            comment.name;


        const date =
            document.createElement("div");

        date.className =
            "comment-date";

        date.textContent =
            formatDate(
                comment.created_at
            );


        header.appendChild(name);

        header.appendChild(date);


        const rating =
            document.createElement("div");

        rating.className =
            "comment-rating";

        rating.textContent =
            createStars(
                comment.rating
            );


        const message =
            document.createElement("div");

        message.className =
            "comment-text";

        message.textContent =
            comment.message;


        card.appendChild(header);

        card.appendChild(rating);

        card.appendChild(message);


        commentsList.appendChild(card);

    });

}


/* =========================
   SUBMIT COMMENT
========================= */

if (commentForm) {

    commentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            hideCommentMessage();


            const name =
                commentName.value.trim();

            const message =
                commentMessage.value.trim();


            if (!name || !message) {

                showCommentMessage(
                    "Please fill in your name and feedback."
                );

                return;
            }


            if (name.length > 50) {

                showCommentMessage(
                    "Name must be 50 characters or less."
                );

                return;
            }


            if (message.length > 500) {

                showCommentMessage(
                    "Feedback must be 500 characters or less."
                );

                return;
            }


            commentSubmit.disabled = true;

            commentSubmit.textContent =
                "Submitting...";


            const {
                error
            } = await client
                .from("comments")
                .insert({
                    name: name,
                    message: message,
                    status: "pending",
                    rating: null
                });


            if (error) {

                console.error(
                    "Comment submission error:",
                    error
                );


                showCommentMessage(
                    "Could not submit your feedback. Please try again."
                );


                commentSubmit.disabled = false;

                commentSubmit.textContent =
                    "Submit Feedback";

                return;
            }


            commentForm.reset();


            showCommentMessage(
                "Thanks! Your feedback was submitted and is waiting for approval."
            );


            commentSubmit.disabled = false;

            commentSubmit.textContent =
                "Submit Feedback";

        }
    );

}


/* =========================
   VISIT COUNTER
========================= */

async function recordVisit() {

    const visitKey =
        "moaz_portfolio_visit";


    const alreadyVisited =
        sessionStorage.getItem(
            visitKey
        );


    if (alreadyVisited) {
        return;
    }


    const {
        error
    } = await client
        .from("site_visits")
        .insert({});


    if (error) {

        console.error(
            "Visit counter error:",
            error
        );

        return;
    }


    sessionStorage.setItem(
        visitKey,
        "true"
    );

}


/* =========================
   START
========================= */

loadVideos();

loadComments();

recordVisit();