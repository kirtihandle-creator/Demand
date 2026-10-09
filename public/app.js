const form = document.getElementById('form');
const input = document.getElementById('url');
const result = document.getElementById('result');
const list = document.getElementById('links');

async function loadLinks() {
  const res = await fetch('/api/links');
  const links = await res.json();
  list.innerHTML = '';
  links.slice(-10).reverse().forEach((link) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/${link.code}`;
    a.textContent = `${location.origin}/${link.code}`;
    li.append(a, ` -> ${link.url} (${link.hits} hits)`);
    list.appendChild(li);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  result.className = '';
  result.textContent = 'Working...';
  const res = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: input.value }),
  });
  const data = await res.json();
  if (!res.ok) {
    result.className = 'error';
    result.textContent = data.error;
    return;
  }
  result.textContent = data.shortUrl;
  input.value = '';
  loadLinks();
});

loadLinks();
