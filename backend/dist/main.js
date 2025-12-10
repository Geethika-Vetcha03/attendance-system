"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (origin.startsWith('http://localhost:'))
                return callback(null, true);
            if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
                return callback(null, true);
            callback(null, false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    await app.listen(port);
    console.log('=====================================');
    console.log(`Backend running on http://localhost:${port}`);
    console.log('Database: PostgreSQL');
    console.log('  Host: localhost:5432');
    console.log('  Database: postgres');
    console.log('  Username: postgres');
    console.log('=====================================');
}
bootstrap();
//# sourceMappingURL=main.js.map