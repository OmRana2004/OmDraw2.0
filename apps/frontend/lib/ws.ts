export const createWS = (token: string) => {
  const ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
  );

  return ws;
};