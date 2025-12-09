import { SubjectsService } from './subjects.service';
export declare class SubjectsController {
    private subjectsService;
    constructor(subjectsService: SubjectsService);
    create(data: any): Promise<import("../../entities").Subject>;
    findAll(classId?: string): Promise<import("../../entities").Subject[]>;
    findOne(id: string): Promise<import("../../entities").Subject>;
    update(id: string, data: any): Promise<import("../../entities").Subject>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
