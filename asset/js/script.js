// Image file functionalities for save post---------------------------------------------------------
document.addEventListener('DOMContentLoaded', imageFileFunctionality);
function imageFileFunctionality() {
    const fileInput = document.getElementById('post-image-input');
    const uploadArea = document.querySelector('.image-upload-area');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    // Check if elements exist before adding event listeners
    if (!fileInput || !uploadArea || !imagePreview || !previewImg) {
        console.error('Required HTML elements not found');
        return;
    }

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Click event for upload area
    uploadArea.addEventListener('click', function (e) {
        e.preventDefault();
        fileInput.click();
    });

    // Add missing dragover event (required for drop to work)
    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#007bff';
        uploadArea.style.background = 'rgba(0,123,255,0.1)';
    });

    uploadArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255,255,255,0.5)';
        uploadArea.style.background = 'rgba(255,255,255,0.05)';
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255,255,255,0.5)';
        uploadArea.style.background = 'rgba(255,255,255,0.05)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Create a new FileList-like object
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            fileInput.files = dt.files;
            handleFileSelect({ target: { files: files } });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPG, PNG, GIF)');
                fileInput.value = '';
                return;
            }

            // Validate file size (5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                fileInput.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                imagePreview.classList.remove('d-none');

                // Update upload area text
                uploadArea.innerHTML = `
                    <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                    <h6 class="mb-1 text-success">Image Selected: ${file.name}</h6>
                    <small class="text-light opacity-75">Click to change image</small>
                `;
            };
            reader.readAsDataURL(file);
        }
    }
}

// Remove image functionality---------------------------------------------------

function removeImage() {
    const fileInput = document.getElementById('post-image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const uploadArea = document.querySelector('.image-upload-area');

    if (!fileInput || !imagePreview || !previewImg || !uploadArea) {
        console.error('Required elements not found for removeImage function');
        return;
    }

    // Reset file input
    fileInput.value = '';

    // Hide preview
    imagePreview.classList.add('d-none');
    previewImg.src = '';

    // Reset upload area content
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-3x text-light mb-3"></i>
        <h6 class="mb-2">Click to upload image or drag & drop</h6>
        <small class="text-light opacity-75">Supports JPG, PNG, GIF (Max 5MB)</small>
    `;
}

// Custom alert class---------------------------------------------------------
class CreateAlert {
    static showAlert(title, text, type) {
        // Check if SweetAlert2 is available
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: text,
                icon: type
            });
        } else {
            // Fallback to regular alert if SweetAlert2 is not available
            alert(`${title}: ${text}`);
        }
    }
}

//POST DATA to server side-----------------------------------------------------------------------------
// Function to save post
function savePost() {
    const titleElement = document.getElementById("postTitle");
    const tagElement = document.getElementById("post-tag");
    const contentElement = document.getElementById("postContent");
    const categoryElement = document.getElementById("post-category");
    const commentsElement = document.getElementById("postComments");
    const imageFileInput = document.getElementById("post-image-input");
    const imagePreview = document.getElementById("image-preview");

    // Check if all required elements exist
    if (!titleElement || !tagElement || !contentElement || !categoryElement || !commentsElement || !imageFileInput) {
        console.error('Required form elements not found');
        CreateAlert.showAlert("Error", "Form elements not found!", "error");
        return;
    }

    const title = titleElement.value.trim();
    const tag = tagElement.value.trim();
    const content = contentElement.value.trim();
    const category = categoryElement.value;
    const comments = commentsElement.value;
    const imageFile = imageFileInput.files[0];

    let imageUrl = "";
    if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
    }

    // Validation
    if (!title) {
        CreateAlert.showAlert("Error", "Title is required!", "error");
        return;
    } else if (!tag) {
        CreateAlert.showAlert("Error", "Tag is required!", "error");
        return;
    } else if (!content) {
        CreateAlert.showAlert("Error", "Content is required!", "error");
        return;
    } else if (!category) {
        CreateAlert.showAlert("Error", "Category must be selected!", "error");
        return;
    } else if (comments && comments < 0) {
        CreateAlert.showAlert("Error", "Comments count cannot be negative!", "error");
        return;
    } else if (!imageFile && (!imagePreview || imagePreview.classList.contains('d-none'))) {
        CreateAlert.showAlert("Error", "Image is required!", "error");
        return;
    } else if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        CreateAlert.showAlert("Error", "Image must be less than 5MB.", "error");
        return;
    }

    // Build post data object
    const postData = {
        "id": null,
        "title": title,
        "content": content,
        "tag": tag,
        "category": category,
        "commentCount": parseInt(comments) || 0,
        "createdAt": null,
        "updatedAt": null,
        "imageUrl": imageUrl
    };

    fetch("http://localhost:8080/blogpost/add-post", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async res => {
        if (!res.ok) {
            const text = await res.text(); // Try to read response text for debugging
            CreateAlert.showAlert("Error", `HTTP error! ${res.status}: ${text}`, "error");
            return;
        }

        try {
            const finalRes = await res.json();
            if (finalRes.status === "success") {
                CreateAlert.showAlert("Success", "Post saved successfully!", "success");
                clearForm();
                // Reload posts to show the new one
                // location.reload();
                return;
            } else {
                CreateAlert.showAlert("Error", `Failed to save post: ${finalRes.message}`, "error");
            }
        } catch (e) {
            CreateAlert.showAlert("Success", "Post saved successfully!", "success");
            clearForm();
            // location.reload();
        }
    }).catch(err => {
        console.error("Error:", err);
        CreateAlert.showAlert("Error", `Failed to save post: ${err.message}`, "error");
    });
}

// Add event listener for save post button
document.addEventListener('DOMContentLoaded', function () {
    const saveBtn = document.getElementById("save-post-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", savePost);
    }
});

// Optional function to clear form after successful save
function clearForm() {
    const elements = [
        "postTitle", "post-tag", "postContent", "post-category", "postComments"
    ];

    elements.forEach(id => {
        document.getElementById(id).value = "";
    });

    removeImage();
}

//load blog post to dashboard-----------------------------------------------------------------------------

// Load data from database
document.addEventListener('DOMContentLoaded', loadPosts);

// Available posts arraylist
let postListArray = [];

function loadPosts() {
    // Clear existing posts first
    postListArray = [];
    const postContainer = document.getElementById("postsContainer");

    if (!postContainer) {
        console.error("Posts container not found");
        return;
    }

    fetch("http://localhost:8080/blogpost/get-all").then(res => {
        return res.json();
    }).then(data => {
        console.log("Data loaded:", data);

        // Clear container first
        postContainer.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            postContainer.innerHTML = `<div class="col-12">
                <div class="card text-center py-5">
                    <div class="card-body">
                        <i class="fas fa-blog fa-4x text-gradient mb-4"></i>
                        <h3 class="fw-bold mb-3">No Posts Yet</h3>
                        <p class="text-muted fs-5 mb-4">Be the first to create a blog post in the darkness!</p>
                        <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#addPostModal">
                            <i class="fas fa-plus me-2"></i>Create First Post
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            data.forEach(dataset => {
                // Add each post to the postListArray
                postListArray.push(dataset);

                postContainer.innerHTML += `<div class="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                <div class="card blog-card h-100">
                    <img src="${dataset.imageUrl}"
                        class="blog-card-img" alt="Blog Image">
                    <div class="card-body">
                        <div class="blog-meta">
                            <span class="category-badge">${dataset.category}</span>
                            <small><i class="fas fa-calendar me-1"></i>${dataset.createdAt || 'No date'}</small>
                        </div>
                        <h5 class="card-title">${dataset.title}</h5>
                        <p class="card-text">${dataset.content}</p>
                        <div class="blog-meta">
                            <small><i class="fas fa-comments me-1"></i>${dataset.commentCount} comments</small>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between gap-2">
                            <button class="btn btn-outline-info btn-sm flex-fill" data-bs-toggle="modal" data-bs-target="#viewPostModal" onclick="viewPost(${dataset.id})">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                            <button class="btn btn-outline-warning btn-sm flex-fill" data-bs-toggle="modal" data-bs-target="#updatePostModal" onclick="updatePost(${dataset.id})">
                                <i class="fas fa-edit me-1"></i>Update
                            </button>
                            <button class="btn btn-outline-danger btn-sm flex-fill" onclick="deletePost(${dataset.id})">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            });
        }
    }).catch(err => {
        console.error("Load error:", err);
        CreateAlert.showAlert("Error", "Failed to load data from server.", "error");
    });
}

// View post ------------------------------------------------------------------------------------------------
function viewPost(id) {
    const viewPostModalContainer = document.getElementById("viewPostModal");
    if (!viewPostModalContainer) {
        console.error("View post modal container not found");
        return;
    }

    const post = postListArray.find(post => post.id === id);
    if (!post) {
        console.error("Post not found with id:", id);
        return;
    }

    viewPostModalContainer.innerHTML = `<div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="viewPostTitle">${post.title}</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div id="viewPostImage" class="d-block text-center mb-4">
                    <img id="viewPostImageElement" src="${post.imageUrl}" class="modal-image" alt="Post Image">
                </div>
                <small><i class="fas fa-comments me-1"></i> ${post.commentCount} comments &nbsp | &nbsp <i class="fas fa-clock me-1"></i> ${post.createdAt || 'No date'}</small>
                <div class="blog-content mt-2 fs-5" id="viewPostContent">${post.content}</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>`;
}

// Update post ------------------------------------------------------------------------------------------------
function updatePost(id) {
    const post = postListArray.find(post => post.id === id);
    if (!post) {
        console.error("Post not found with id:", id);
        return;
    }

    // Initialize image functionality for update modal
    initializeUpdateImageFunctionality();

    // Populate form fields
    const titleElement = document.getElementById("update-post-title");
    const tagElement = document.getElementById("update-post-tag");
    const contentElement = document.getElementById("update-post-content");
    const categoryElement = document.getElementById("update-post-category");
    const commentsElement = document.getElementById("update-post-comment");

    if (titleElement) titleElement.value = post.title;
    if (tagElement) tagElement.value = post.tag;
    if (contentElement) contentElement.value = post.content;
    if (categoryElement) categoryElement.value = post.category;
    if (commentsElement) commentsElement.value = post.commentCount;

    // Store the post ID for the update function
    window.currentUpdatePostId = id;
}

// Initialize image functionality for update modal
function initializeUpdateImageFunctionality() {
    const fileInput = document.getElementById('update-post-image-input');
    const uploadArea = document.querySelector('.update-image-upload-area');
    const imagePreview = document.getElementById('update-image-preview');
    const previewImg = document.getElementById('update-preview-img');

    if (!fileInput || !uploadArea || !imagePreview || !previewImg) {
        console.log('Update image elements not found - may not be needed');
        return;
    }

    // Remove existing listeners to prevent duplicates
    fileInput.removeEventListener('change', handleUpdateFileSelect);
    uploadArea.removeEventListener('click', handleUpdateUploadClick);

    // Add event listeners
    fileInput.addEventListener('change', handleUpdateFileSelect);
    uploadArea.addEventListener('click', handleUpdateUploadClick);

    function handleUpdateUploadClick(e) {
        e.preventDefault();
        fileInput.click();
    }

    function handleUpdateFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPG, PNG, GIF)');
                fileInput.value = '';
                return;
            }

            // Validate file size (5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                fileInput.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                imagePreview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    }
}

// Function to handle update post submission
function submitUpdatePost() {
    const titleElement = document.getElementById("update-post-title");
    const tagElement = document.getElementById("update-post-tag");
    const contentElement = document.getElementById("update-post-content");
    const categoryElement = document.getElementById("update-post-category");
    const commentsElement = document.getElementById("update-post-comment");
    const imageFileInput = document.getElementById("update-post-image-input");

    // Check if all required elements exist
    if (!titleElement || !tagElement || !contentElement || !categoryElement || !commentsElement) {
        console.error('Required form elements not found');
        CreateAlert.showAlert("Error", "Form elements not found!", "error");
        return;
    }

    const title = titleElement.value.trim();
    const tag = tagElement.value.trim();
    const content = contentElement.value.trim();
    const category = categoryElement.value;
    const comments = commentsElement.value;
    const imageFile = imageFileInput ? imageFileInput.files[0] : null;

    // Validation
    if (!title) {
        CreateAlert.showAlert("Error", "Title is required!", "error");
        return;
    } else if (!tag) {
        CreateAlert.showAlert("Error", "Tag is required!", "error");
        return;
    } else if (!content) {
        CreateAlert.showAlert("Error", "Content is required!", "error");
        return;
    } else if (!category) {
        CreateAlert.showAlert("Error", "Category must be selected!", "error");
        return;
    } else if (comments && comments < 0) {
        CreateAlert.showAlert("Error", "Comments count cannot be negative!", "error");
        return;
    } else if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        CreateAlert.showAlert("Error", "Image must be less than 5MB.", "error");
        return;
    }

    // Build post data object
    const postData = {
        "id": window.currentUpdatePostId,
        "title": title,
        "content": content,
        "tag": tag,
        "category": category,
        "commentCount": parseInt(comments) || 0,
        "createdAt": null,
        "updatedAt": null,
        "imageUrl": imageFile ? URL.createObjectURL(imageFile) : null
    };

    fetch("http://localhost:8080/blogpost/update-post", {
        method: "PUT",
        body: JSON.stringify(postData),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async res => {
        if (!res.ok) {
            const text = await res.text();
            CreateAlert.showAlert("Error", `HTTP error! ${res.status}: ${text}`, "error");
            return;
        }

        try {
            const finalRes = await res.json();
            if (finalRes.status === "success") {
                CreateAlert.showAlert("Success", "Post updated successfully!", "success");
                clearUpdateForm();
                location.reload();
            } else {
                CreateAlert.showAlert("Error", `Failed to update post: ${finalRes.message}`, "error");
            }
        } catch (e) {
            CreateAlert.showAlert("Success", "Post updated successfully!", "success");
            clearUpdateForm();
            location.reload();
        }
    }).catch(err => {
        console.error("Error:", err);
        CreateAlert.showAlert("Error", `Failed to update post: ${err.message}`, "error");
    });
}

// Clear update form
function clearUpdateForm() {
    const elements = [
        "update-post-title", "update-post-tag", "update-post-content",
        "update-post-category", "update-post-comment"
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    const imageInput = document.getElementById("update-post-image-input");
    if (imageInput) imageInput.value = '';

    const imagePreview = document.getElementById("update-image-preview");
    if (imagePreview) imagePreview.classList.add('d-none');
}

// Add event listener for update post button
document.addEventListener('DOMContentLoaded', function () {
    const updateBtn = document.getElementById("update-post-btn");
    if (updateBtn) {
        updateBtn.addEventListener("click", submitUpdatePost);
    }
});

// Delete post function
function deletePost(id) {
    if (confirm("Are you sure you want to delete this post?")) {
        fetch(`http://localhost:8080/blogpost/delete-post/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async res => {
            if (!res.ok) {
                const text = await res.text();
                CreateAlert.showAlert("Error", `HTTP error! ${res.status}: ${text}`, "error");
                return;
            }

            try {
                const finalRes = await res.json();
                if (finalRes.status === "success") {
                    CreateAlert.showAlert("Success", "Post deleted successfully!", "success");
                    location.reload();
                } else {
                    CreateAlert.showAlert("Error", `Failed to delete post: ${finalRes.message}`, "error");
                }
            } catch (e) {
                CreateAlert.showAlert("Success", "Post deleted successfully!", "success");
                location.reload();
            }
        }).catch(err => {
            console.error("Error:", err);
            CreateAlert.showAlert("Error", `Failed to delete post: ${err.message}`, "error");
        });
    }
}