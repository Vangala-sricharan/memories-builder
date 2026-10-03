import app from './_lib/app.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '60mb',
    },
  },
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
