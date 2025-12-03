export async function deleteXlsxNone() {
  return new Response(JSON.stringify({ error: "DELETE não suportado" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
