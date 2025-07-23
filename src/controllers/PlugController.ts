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
        this.router.post('/', this.createPlugRoute.bind(this));
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
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const summaries = await this.plugRepository.getSummariesByPlugId(plugId, today, new Date());
                const measurements = await this.plugRepository.getMeasurementsByPlugId(plugId, today, new Date());

                res.status(200).json({
                    message: 'Report for today is not available yet',
                    data: [
                        ...summaries.map((summary) => ({
                            timestamp: summary.startAt,
                            power: summary.powerAvg,
                            current: summary.currentAvg,
                            voltage: summary.voltageAvg,
                            tempC: summary.tempCAvg,
                            tempF: summary.tempFAvg,
                        })),
                        ...measurements.map((measurement) => ({
                            timestamp: measurement.createdAt,
                            power: measurement.power,
                            current: measurement.current,
                            voltage: measurement.voltage,
                            tempC: measurement.tempC,
                            tempF: measurement.tempF,
                        })),
                    ],
                });
            } else {
                const report = await this.plugRepository.getPlugReport(plugId, new Date(reportDate));

                res.status(200).json({
                    message: 'Report retrieved successfully',
                    data:
                        report?.summaries.map((summary) => ({
                            timestamp: summary.startAt,
                            power: summary.powerAvg,
                            current: summary.currentAvg,
                            voltage: summary.voltageAvg,
                            tempC: summary.tempCAvg,
                            tempF: summary.tempFAvg,
                        })) || [],
                });
            }
        } catch (err) {
            next(err);
        }
    }

    private async createPlugRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, url, isProtected, autoShutdownThreshold } = req.body;

            if (!name || typeof name !== 'string') {
                throw new RouteError(400, 'The field "name" is required and must be a non-empty string');
            }

            if (!url || typeof url !== 'string') {
                throw new RouteError(400, 'The field "url" is required and must be a non-empty string');
            }

            if (isProtected === undefined || typeof isProtected !== 'boolean') {
                throw new RouteError(400, 'The field "isProtected" must be a boolean');
            }

            if (
                autoShutdownThreshold === undefined ||
                (autoShutdownThreshold !== null &&
                    (typeof autoShutdownThreshold !== 'number' || autoShutdownThreshold < 0))
            ) {
                throw new RouteError(400, 'The field "autoShutdownThreshold" must be a non-negative number or null');
            }

            const createdPlug = await this.plugRepository.create({
                name,
                url,
                isProtected: isProtected,
                autoShutdownThreshold: autoShutdownThreshold,
                isOn: false,
            });

            if (createdPlug) {
                res.status(201).json({
                    message: 'Plug created successfully',
                    data: {
                        id: createdPlug.getId(),
                        name: createdPlug.getName(),
                        url: createdPlug.getUrl(),
                        isProtected: createdPlug.getIsProtected(),
                        autoShutdownThreshold: createdPlug.getAutoShutdownThreshold(),
                    },
                });
            } else {
                throw new RouteError(500, 'Failed to create plug');
            }
        } catch (err) {
            next(err);
        }
    }
}
