import winston from "winston";
import expressWinston from "express-winston";
import "winston-daily-rotate-file";
import "winston-mongodb";
import { ElasticsearchTransport } from "winston-elasticsearch";
import { Request, Response } from "express";

const isTest = process.env.NODE_ENV === "test";

const getMessage = (req: Request, res: Response) => {
  const obj = {
    correlation_id: req.headers["x-correlation-id"],
    request_body: req.body,
    request_params: req.params,
    request_query: req.query,
    request_url: req.originalUrl,
    request_protocol: req.protocol,
    method: req.method,
    ip: req.ip,
    host: req.hostname,
    origin_host: req.get('host'),
  }

  return JSON.stringify(obj);
}

const format = winston.format.combine(
  winston.format(info => ({ ...info, level: info.level }))(),
  winston.format.align(),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
  winston.format.simple(),
  winston.format.splat(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, ...r }) => {
      return `[ ${level} ] ${timestamp}: ${message}`;
    }
  )
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.cli({
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'green',
        verbose: 'cyan',
        debug: 'white'
      }
    }),
    format
  ),
  handleExceptions: true,
})

const fileInfoTransport = new (winston.transports.DailyRotateFile)({
  filename: "log-info-%DATE%.log",
  dirname: "logs",
  datePattern: "yyyy-MM-DD-HH"
})

const fileErrorTransport = new (winston.transports.DailyRotateFile)({
  filename: "log-error-%DATE%.log",
  dirname: "logs",
  datePattern: "yyyy-MM-DD-HH"
})

// const mongoErrorTransport = new (winston.transports.MongoDB)({
//   db: process.env.MONGODB_URI!,
//   metaKey: "meta",
// })

const esTransport = new ElasticsearchTransport({
  level: "info",
  clientOpts: {
    node: 'http://localhost:9200',
  },
  indexPrefix: `${(process.env.NODE_ENV || "dev").toLowerCase()}-logs`,
});

export const infoLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console(),
    fileInfoTransport,
    esTransport,
  ],
  format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  meta: false,
  msg: getMessage
})

export const errLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console(),
    fileErrorTransport,
    esTransport,
    // mongoErrorTransport
  ],
  format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  meta: true,
  msg: "{ 'correlation_id': '{{req.headers['x-correlation-id']}}', error: '{{err.message}}', stack: '{{err.stack}}' }"
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isTest ? "warn" : "info"),
  transports: [
    consoleTransport,
  ]
});

logger.on('error', (error) => {
  console.error('Error in logger caught', error);
});

esTransport.on('error', (error) => {
  console.error('Error in logger caught', error);
});

export default logger;