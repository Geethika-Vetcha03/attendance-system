import { ClassesService } from './classes.service';
export declare class ClassesController {
    private classesService;
    constructor(classesService: ClassesService);
    create(data: any): Promise<import("../../entities").Class>;
    findAll(): Promise<import("../../entities").Class[]>;
    findOne(id: string): Promise<import("../../entities").Class>;
    update(id: string, data: any): Promise<import("../../entities").Class>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
