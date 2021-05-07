import unfetch from "isomorphic-unfetch";

export async function fetch(url, options) {
  const response = await unfetch(url, options);

  return response.json();
}

export async function fetchText(url, options) {
  const response = await unfetch(url, options);

  return response.text();
}

export async function fetchRaw(url, options) {
  const response = await unfetch(url, options);

  return response;
}
