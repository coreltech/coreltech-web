// assets/js/blog.js

async function fetchBlogPosts() {
  const container = document.getElementById("blog-posts");

  try {
    const response = await fetch("blog-feed/posts.json");
    const posts = await response.json();

    // Mostrar los 3 artículos más recientes
    const latestPosts = posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    latestPosts.forEach(post => {
      const postElement = document.createElement("div");
      postElement.className = "post";

      const thumbnail = post.thumbnail || 'assets/img/blog-article-default.webp';

      postElement.innerHTML = `
        <img src="${thumbnail}" alt="${post.title}" class="service-img">
        <h4>${post.title}</h4>
        <p>${new Date(post.date).toLocaleDateString()}</p>
        <a href="${post.url}" target="_blank" class="btn-secondary">Leer más</a>
      `;
      container.appendChild(postElement);
    });
  } catch (error) {
    container.innerHTML = "<p>No se pudieron cargar los artículos del blog</p>";
    console.error("Error al cargar el blog:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchBlogPosts);