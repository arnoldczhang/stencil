import * as d from '../declarations';
import { hasError } from './cli-utils';
import { help } from './task-help';
import { startDevServer } from './serve';


export async function runTask(process: NodeJS.Process, config: d.Config, compiler: any, flags: d.ConfigFlags) {
  switch (flags.task) {
    case 'build':
      const results = await compiler.build();
      if (!config.watch && hasError(results && results.diagnostics)) {
        process.exit(1);
      }

      if (config.watch || (config.devServer && config.devServer.startDevServer)) {
        process.once('SIGINT', () => {
          process.exit(0);
        });
      }
      return results;

    case 'docs':
      return compiler.docs();

    case 'serve':
      return startDevServer(config, compiler);

    default:
      config.logger.error(`Invalid stencil command, please see the options below:`);
      help(process, config.logger);
      process.exit(1);
  }
}
