// Image upload functionality
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('post-image-input');
    const uploadArea = document.querySelector('.image-upload-area');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Click event for upload area
    uploadArea.addEventListener('click', function (e) {
        e.preventDefault();
        fileInput.click();
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
            fileInput.files = files;
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
});

function removeImage() {
    const fileInput = document.getElementById('post-image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const uploadArea = document.querySelector('.image-upload-area');

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

class CreateAlert {
    static showAlert(title, text, type) {
        Swal.fire({
            title: title,
            text: text,
            icon: type
        });
    }
}

function savePost() {
    // Get values from form
    // const postId = document.getElementById("postId").value.trim();
    const title = document.getElementById("postTitle").value.trim();
    const author = document.getElementById("postAuthor").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const category = document.getElementById("post-category").value;
    const comments = document.getElementById("postComments").value;
    const imageFile = document.getElementById("post-image-input").files[0];



    // Basic validation
    if (!title) {
        CreateAlert.showAlert("Error", "Title is required!", "error");
        return;
    }else if (!author) {
        CreateAlert.showAlert("Error", "Author is required!", "error");
        return;
    }else if (!content) {
        CreateAlert.showAlert("Error", "Content is required!", "error");
        return;
    }else if (!category) {
        CreateAlert.showAlert("Error", "Category must be selected!", "error");
        return;
    }else if (comments < 0) {
        CreateAlert.showAlert("Error", "Comments count cannot be negative!", "error");
        return;
    }else if(!imageFile && document.getElementById("image-preview").classList.contains('d-none')) {
        CreateAlert.showAlert("Error", "Image is required!", "error");
        return;

    }else if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        CreateAlert.showAlert("Error", "Image must be less than 5MB.", "error");
        return;
    }

    // Build post data object
    const postData = {
        id: postId || null,
        title: title,
        author: author,
        content: content,
        category: category,
        comments: parseInt(comments),
        image: imageFile || null // optional
    };

    console.log("Collected Post Data:", postData);

    // You can now send this data via fetch/AJAX or process as needed
}


// Trigger savepost button click
document.getElementById("save-post-btn").addEventListener('click',savePost);