import { NextFunction, Request, Response } from 'express';
import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import RouteError from 'src/components/server/RouteError';
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
        this.router.get('/:id/report/:report', this.getPlugReport.bind(this));
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

    private async getPlugReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const plugId = Number(req.params.id);

            if (!plugId || isNaN(Number(plugId))) {
                throw new RouteError(400, 'Invalid plug ID');
            }

            const reportDate = req.params.report;

            if (!reportDate || (reportDate !== 'today' && new Date(reportDate).toString() === 'Invalid Date')) {
                throw new RouteError(400, 'Invalid report date');
            }

            if (reportDate === 'today') {
                res.status(200).json({
                    message: 'Report for today is not available yet',
                    data: null,
                });
            } else {
                const report = await this.plugRepository.getPlugReport(plugId, new Date(reportDate));
                console.log(report);

                res.status(200).json({
                    message: 'Report retrieved successfully',
                    data: report,
                });
            }
        } catch (err) {
            console.log(err);

            next(err);
        }
    }
}
