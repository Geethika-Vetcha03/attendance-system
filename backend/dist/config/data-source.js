"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const enableSsl = (() => {
    if (process.env.DATABASE_SSL && process.env.DATABASE_SSL.toLowerCase() === 'true')
        return true;
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'))
        return true;
    return false;
})();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    ssl: enableSsl ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=data-source.js.map