async function run() {
  const res = await fetch("http://localhost:4011/api/applications", {
    headers: { "Authorization": "Bearer TEST", "Content-Type": "application/json" }
  });
  console.log(res.status);
}
run();
