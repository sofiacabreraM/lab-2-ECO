async function fetchData() {
  renderLoadingState();
  try {
    const [postsResponse, usersResponse] = await Promise.all([
      fetch("http://localhost:3004/posts"),
      fetch("http://localhost:3004/users")
    ]);

    if (!postsResponse.ok || !usersResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const posts = await postsResponse.json();
    const users = await usersResponse.json();

    const userMap = new Map();
    users.forEach(user => userMap.set(user.id, user.name));

    renderData(posts, userMap);
  } catch (error) {
    renderErrorState();
  }
}


function renderData(posts, userMap) {
  const container = document.getElementById("data-container");
  container.innerHTML = ""; 

  if (posts.length > 0) {
    posts.reverse().forEach((post) => {  
      const div = document.createElement("div");
      div.className = "item";
      div.setAttribute("data-id", post.id); 
      div.innerHTML = `
        <strong>${userMap.get(post.userId)}</strong> <!-- Mostrar el nombre del usuario -->
        <h3>${post.title}</h3> <!-- Título de la publicación -->
        <p>${post.body}</p> <!-- Cuerpo de la publicación -->
        <button class="delete-button">Delete</button>
      `;
      container.appendChild(div);
    });
  }
}


function renderLoadingState() {
  const container = document.getElementById("data-container");
  container.innerHTML = "<p>Loading...</p>";
}


function renderErrorState() {
  const container = document.getElementById("data-container");
  container.innerHTML = "<p>Failed to load data</p>";
  console.error("Failed to load data");
}


async function createPost(event) {
  event.preventDefault(); 

  const userId = document.getElementById("user-id").value.trim();
  const title = document.getElementById("title").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!userId || !title || !body) {
    alert("All fields are required!");
    return;
  }

  const postData = {
    userId: parseInt(userId), 
    title: title,
    body: body
  };

  try {
    const response = await fetch("http://localhost:3004/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const newPost = await response.json();
    console.log("Post created successfully:", newPost);

    const container = document.getElementById("data-container");
    const div = document.createElement("div");
    div.className = "item";
    div.setAttribute("data-id", newPost.id);
    div.innerHTML = `
      <strong>${document.getElementById("user-id").value}</strong>
      <h3>${newPost.title}</h3>
      <p>${newPost.body}</p>
      <button class="delete-button">Delete</button>
    `;
    container.insertBefore(div, container.firstChild);

   
    document.getElementById("post-form").reset();

  } catch (error) {
    console.error("Failed to create post", error);
    alert("Error creating post. Please try again.");
  }
}


async function deletePost(postId) {
  try {
    const response = await fetch(`http://localhost:3004/posts/${postId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

 
    document.querySelector(`[data-id='${postId}']`).remove();
    console.log(`Post ${postId} deleted successfully`);

  } catch (error) {
    console.error("Failed to delete post", error);
  }
}


document.getElementById("data-container").addEventListener("click", function(event) {
  if (event.target && event.target.matches("button.delete-button")) {
    const postId = event.target.closest(".item").getAttribute("data-id");
    deletePost(postId);
  }
});

document.getElementById("fetch-button").addEventListener("click", fetchData);

document.getElementById("post-form").addEventListener("submit", createPost);
