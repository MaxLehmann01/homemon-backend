import { Request, Response } from 'express';
import AbstractController from 'src/controllers/AbstractController';

export default class IndexController extends AbstractController {
    protected useRoutes(): void {
        this.router.get('/', this.welcomeRoute.bind(this));
    }

    private async welcomeRoute(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: 'Welcome to the API',
            data: {
                version: process.env.npm_package_version,
            },
        });
    }
}
