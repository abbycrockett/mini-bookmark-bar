function getFaviconUrl(url) {
  try {
    // Use Navi blue bookmark icon for about:blank, about:blank#blocked, or URLs containing 'newtab' or 'extensions'
    if (
      typeof url === "string" &&
      (url.startsWith("about:blank") ||
        url.includes("newtab") ||
        url.includes("extensions"))
    ) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="%2300BFFF" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/></svg>';
    }

    const u = new URL(url);
    if (u.hostname === "docs.google.com") {
      // Use local Google Docs icon for docs.google.com main page
      if (u.pathname.startsWith("/spreadsheets")) {
        // Use local Google Sheets icon for Google Sheets URLs
        return "google-sheets.png";
      }
      return "google-docs.png";
    }
    if (u.hostname === "calendar.google.com") {
      // Use local Google Calendar icon for Google Calendar URLs
      return "google-calendar.png";
    }
    if (u.hostname.endsWith("github.io")) {
      // Use GitHub favicon for github.io sites
      return "https://github.com/favicon.ico";
    }
    if (u.hostname.endsWith("todoist.com")) {
      // Use Todoist favicon for todoist.com sites
      return "https://app.todoist.com/favicon.ico";
    }
    // Try Google favicon service first
    return `https://www.google.com/s2/favicons?domain=${u.hostname}`;
  } catch {
    return "";
  }
}

function getFallbackFaviconUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

const FRIENDLY_NAMES = {
  "www.instagram.com": "Instagram",
  "instagram.com": "Instagram",
  "www.todoist.com": "Todoist",
  "todoist.com": "Todoist",
  "app.todoist.com": "Todoist",
  "www.github.com": "GitHub",
  "github.com": "GitHub",
  "www.youtube.com": "YouTube",
  "youtube.com": "YouTube",
  "www.facebook.com": "Facebook",
  "facebook.com": "Facebook",
  "www.twitter.com": "Twitter",
  "twitter.com": "Twitter",
  "www.linkedin.com": "LinkedIn",
  "linkedin.com": "LinkedIn",
  "www.google.com": "Google",
  "google.com": "Google",
  "www.netflix.com": "Netflix",
  "netflix.com": "Netflix",
  "x.com": "X",
  "chatgpt.com": "ChatGPT",
  "www.chatgpt.com": "ChatGPT",
  "poe.com": "Poe",
  "docs.google.com": "Google Docs",
};

function getFriendlyName(url, title) {
  // Check for custom name in localStorage
  const customNames = JSON.parse(
    localStorage.getItem("customBookmarkNames") || "{}"
  );
  if (customNames[url]) return customNames[url];
  if (title && title.trim()) return title;
  try {
    const u = new URL(url);
    if (FRIENDLY_NAMES[u.hostname]) {
      return FRIENDLY_NAMES[u.hostname];
    }
    // For github.io, use GitHub Pages
    if (u.hostname.endsWith("github.io")) {
      return "GitHub Pages";
    }
    // Otherwise, use domain
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function showTopLevelBookmarks(bookmarkNodes, parent) {
  // Get saved order or use default
  const savedOrder = JSON.parse(localStorage.getItem("bookmarkOrder") || "[]");
  let orderedNodes = [...bookmarkNodes];

  if (savedOrder.length > 0) {
    orderedNodes.sort((a, b) => {
      const indexA = savedOrder.indexOf(a.url);
      const indexB = savedOrder.indexOf(b.url);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  orderedNodes.forEach((node, index) => {
    if (
      node.url &&
      !node.url.startsWith("chrome://") &&
      !node.url.startsWith("chrome-extension://") &&
      !node.url.startsWith("about:")
    ) {
      const link = document.createElement("a");
      link.href = node.url;
      link.target = "_blank";
      link.className = "bookmark";
      link.draggable = true;
      link.dataset.url = node.url;
      link.dataset.index = index;

      // Drag handle
      const dragHandle = document.createElement("img");
      dragHandle.src =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="%2390ee90" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';
      dragHandle.className = "drag-handle";
      dragHandle.title = "Drag to reorder";
      link.appendChild(dragHandle);

      const favicon = document.createElement("img");
      favicon.src = getFaviconUrl(node.url);
      favicon.className = "favicon";
      favicon.width = 16;
      favicon.height = 16;
      favicon.alt = "";
      favicon.style.marginRight = "6px";
      // Set white background for GitHub Pages, ChatGPT, and Google Calendar
      try {
        const u = new URL(node.url);
        if (
          u.hostname.endsWith("github.io") ||
          u.hostname.endsWith("chatgpt.com") ||
          u.hostname === "www.chatgpt.com" ||
          u.hostname === "calendar.google.com"
        ) {
          favicon.style.background = "#fff";
          favicon.style.borderRadius = "4px";
          favicon.style.boxShadow = "0 0 0 1px #eee";
        }
      } catch {}
      // If favicon fails to load, try fallback
      favicon.onerror = function () {
        favicon.onerror = function () {
          // If fallback also fails, use bookmark icon SVG
          favicon.onerror = null;
          favicon.src =
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="%2300BFFF" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/></svg>';
        };
        favicon.src = getFallbackFaviconUrl(node.url);
      };
      link.appendChild(favicon);
      let displayName = getFriendlyName(node.url, node.title);
      const nameSpan = document.createElement("span");
      nameSpan.textContent = displayName;
      nameSpan.className = "bookmark-name";
      link.appendChild(nameSpan);

      // Edit icon SVG - clean pencil icon
      const editIcon = document.createElement("img");
      editIcon.src =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><path fill="%2300BFFF" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>';
      editIcon.className = "edit-icon";
      editIcon.title = "Edit name";
      link.appendChild(editIcon);

      editIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Replace nameSpan with input
        const input = document.createElement("input");
        input.type = "text";
        input.value = displayName;
        input.className = "edit-input";
        link.replaceChild(input, nameSpan);
        input.focus();

        // Save on blur or Enter
        function save() {
          const customNames = JSON.parse(
            localStorage.getItem("customBookmarkNames") || "{}"
          );
          customNames[node.url] = input.value.trim() || displayName;
          localStorage.setItem(
            "customBookmarkNames",
            JSON.stringify(customNames)
          );
          nameSpan.textContent = customNames[node.url];
          link.replaceChild(nameSpan, input);
        }
        input.addEventListener("blur", save);
        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") {
            input.blur();
          } else if (ev.key === "Escape") {
            link.replaceChild(nameSpan, input);
          }
        });
      });

      // Drag and drop event listeners
      link.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", node.url);
        link.classList.add("dragging");
      });

      link.addEventListener("dragend", () => {
        link.classList.remove("dragging");
        document.querySelectorAll(".bookmark").forEach((b) => {
          b.classList.remove("drag-over", "drag-over-below");
        });
      });

      link.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!link.classList.contains("dragging")) {
          const rect = link.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const isLastChild = link === link.parentNode.lastElementChild;

          // Clear all drag over classes
          document.querySelectorAll(".bookmark").forEach((b) => {
            b.classList.remove("drag-over", "drag-over-below");
          });

          if (isLastChild) {
            // For last element, always show bottom border
            link.classList.add("drag-over-below");
          } else if (e.clientY < midY) {
            // Mouse in top half, show top border
            link.classList.add("drag-over");
          } else {
            // Mouse in bottom half, show bottom border
            link.classList.add("drag-over-below");
          }
        }
      });

      link.addEventListener("dragleave", (e) => {
        // Only remove if we're actually leaving the element
        const rect = link.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          link.classList.remove("drag-over", "drag-over-below");
        }
      });

      link.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedUrl = e.dataTransfer.getData("text/plain");
        const dropTargetUrl = node.url;

        if (draggedUrl !== dropTargetUrl) {
          const rect = link.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const isLastChild = link === link.parentNode.lastElementChild;
          const dropBelow = isLastChild || e.clientY >= midY;

          reorderBookmarks(draggedUrl, dropTargetUrl, dropBelow);
        }
        link.classList.remove("drag-over", "drag-over-below");
      });

      parent.appendChild(link);
    }
    // Ignore folders and their children
  });
}

function reorderBookmarks(draggedUrl, dropTargetUrl, dropBelow = false) {
  const bookmarks = Array.from(document.querySelectorAll(".bookmark"));
  const urls = bookmarks.map((b) => b.dataset.url);

  const draggedIndex = urls.indexOf(draggedUrl);
  const dropIndex = urls.indexOf(dropTargetUrl);

  if (draggedIndex !== -1 && dropIndex !== -1) {
    urls.splice(draggedIndex, 1);

    let insertIndex = dropIndex;
    if (draggedIndex < dropIndex) {
      insertIndex--; // Adjust for removed element
    }
    if (dropBelow) {
      insertIndex++;
    }

    urls.splice(insertIndex, 0, draggedUrl);

    localStorage.setItem("bookmarkOrder", JSON.stringify(urls));

    // Refresh the display
    location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const container = document.getElementById("bookmarks");
    const bookmarksBar = bookmarkTreeNodes[0].children.find(
      (node) =>
        node.title === "Bookmarks Bar" ||
        node.title === "Bookmarks Toolbar" ||
        node.id === "1"
    );
    if (bookmarksBar && bookmarksBar.children) {
      showTopLevelBookmarks(bookmarksBar.children, container);
    }
  });
});
