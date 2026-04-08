async function run() {
  const res = await fetch("http://localhost:4011/api/applications", {
    headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMCI..." }
  });
  console.log(await res.text());
}
run();
