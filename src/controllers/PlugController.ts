import { NextFunction, Request, Response } from 'express';
import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import AbstractController from 'src/controllers/AbstractController';
import PlugRepository from 'src/repository/PlugRepository';

export default class PlugController extends AbstractController {
    private plugRepository: PlugRepository;

    constructor(logger: LoggerInterface, plugRepository: PlugRepository) {
        super(logger);
        this.plugRepository = plugRepository;
    }

    protected useRoutes(): void {
        this.router.get('/', this.getPlugsRoute.bind(this));
    }

    private async getPlugsRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const plugs = await this.plugRepository.findAll();

            res.status(200).json({
                message: 'Plugs retrieved successfully',
                data: plugs.map((plug) => ({
                    id: plug.getId(),
                    name: plug.getName(),
                    url: plug.getUrl(),
                })),
            });
        } catch (err) {
            next(err);
        }
    }
}
