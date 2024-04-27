import { Request, Response, Router } from "express";

type AsyncHandler = (req: Request, res: Response) => Promise<any>;

type RouteCollector = {
  router: Router;
  get: (path: string, handler: AsyncHandler) => void;
  put: (path: string, handler: AsyncHandler) => void;
};

export const route = (): RouteCollector => {
  const router = Router();
  return {
    router,
    get: (path, handler) => router.get(path, http(handler)),
    put: (path, handler) => router.put(path, http(handler)),
  };
};

function http(handler: AsyncHandler) {
  return (req: Request, res: Response) => {
    handler(req, res)
      .then(async (content) => {
        if (content) {
          res.status(200).send(content);
        } else {
          res.status(204).send();
        }
      })
      .catch((err) => {
        console.log(err)
        const data = err.message;
        res.status(500).send(data);
      });
  };
}