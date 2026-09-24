/* Admin auth guard — include this before any other script on admin-*.html pages.
   Redirects to login if there's no token, or if the logged-in user isn't an admin. */
(function () {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  let user = null;

  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    user = null;
  }

  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html?next=admin";
    // Stop the rest of the page's scripts from running against a 403'd API.
    throw new Error("Admin authentication required");
  }

  window.ADMIN_USER = user;
})();

/* Use this instead of fetch() for any admin API call that requires a token. */
function adminFetch(url, options) {
  options = options || {};
  const headers = Object.assign({}, options.headers, {
    Authorization: "Bearer " + localStorage.getItem("token")
  });
  options.headers = headers;

  return fetch(url, options).then(function (res) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html?next=admin";
    }
    return res;
  });
}
