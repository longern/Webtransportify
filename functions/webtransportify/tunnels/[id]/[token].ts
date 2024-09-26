export const onRequestPost = async (context: any) => {
  const { request, env, params } = context;
  const db = env.DB;

  const id = params.id;
  const token = params.token;

  const tunnel = await db
    .prepare("SELECT id, token FROM wt_tunnels WHERE id = ?")
    .bind(id)
    .first();
  if (!tunnel) return new Response("Not Found", { status: 404 });
  if (tunnel.token !== token)
    return new Response("Unauthorized", { status: 401 });

  const certificateHash = await request.text();
  const now = request.headers.has("Date")
    ? new Date(request.headers.get("Date")).getTime()
    : Date.now();

  try {
    await db
      .prepare(
        "UPDATE wt_tunnels SET certificate_hash = ?, alt_certificate_hash = certificate_hash, updated_at = ? WHERE id = ?"
      )
      .bind(certificateHash, now, id)
      .all();
  } catch (e) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(null, { status: 204 });
};
