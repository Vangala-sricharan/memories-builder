import app from '../server/app';

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
