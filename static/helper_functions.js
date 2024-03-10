async function CallApi(apiEndPoint, queryParams, requestHeader, type) {
  let url =
    apiEndPoint +
    "?" +
    Object.keys(queryParams)
      .map((key) => key + "=" + encodeURIComponent(queryParams[key]))
      .join("&");
  if (Object.keys(queryParams).length == 0) {
    url = apiEndPoint;
  }
  let urlHeaders = new Headers();
  urlHeaders.append("Accept", "application/json");
  urlHeaders.append("Content-Type", "application/json");
  urlHeaders.append("Api-Key", localStorage.getItem("Sukruth-Ganesh-Api-Key"));
  urlHeaders.append("User-Id", localStorage.getItem("Sukruth-Ganesh-User-Id"));

  Object.keys(requestHeader).forEach(function (key) {
    urlHeaders.append(key, requestHeader[key]);
  });

  data = await fetch(url, {
    method: type,
    headers: urlHeaders,
  });
  return data.json();
}

function EmptyTheClass(element) {
  let child = element.lastElementChild;
  while (child) {
    element.removeChild(child);
    child = element.lastElementChild;
  }
}

function PersistUser(dict) {
  localStorage.setItem("Sukruth-Ganesh-User-Id", dict.user_id);
  localStorage.setItem("Sukruth-Ganesh-User-Name", dict.user_name);
  localStorage.setItem("Sukruth-Ganesh-Api-Key", dict.api_key);
}
