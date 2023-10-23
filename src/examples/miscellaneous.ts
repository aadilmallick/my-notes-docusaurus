async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = -1
) {
  // user has specified they want a timeout for fetch
  if (timeout > 0) {
    let controller = new AbortController();
    options.signal = controller.signal;

    setTimeout(() => {
      controller.abort();
    }, timeout);
  }

  return fetch(url, options);
}

// fetches google with a timeout of 1 second, aborting the request if it takes any longer
fetchWithTimeout("https://google.com", {}, 1000);
