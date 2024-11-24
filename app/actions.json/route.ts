import { ActionsJson, createActionHeaders } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/",
        apiPath: "/api/reclaim-rent/",
      },
      // fallback route
      {
        pathPattern: "/api/form/",
        apiPath: "/api/reclaim-rent/",
      },
    ],
  };

  return Response.json(payload, {
    headers: createActionHeaders(),
  });
};
// ensures cors
export const OPTIONS = GET;
