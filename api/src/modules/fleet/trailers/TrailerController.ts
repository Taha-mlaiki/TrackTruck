import { Request, Response, NextFunction } from "express";
import { TrailerService } from "./TrailerService";

export class TrailerController {
  constructor(private service: TrailerService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trailer = await this.service.createTrailer(req.body);
      res.status(201).json(trailer);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trailer = await this.service.getTrailerById(req.params.id);
      res.json(trailer);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trailers = await this.service.listTrailers();
      res.json(trailers);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateTrailer(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteTrailer(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
