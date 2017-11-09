import { IOptions } from 'glob';
import * as globby from 'globby';
import * as fs from 'graceful-fs';

export interface ConcatGlobOptions {
  glob?: IOptions;
  separator?: string;
}

const defaultConcatGlobOptions: ConcatGlobOptions = {
  glob: {
    dot: true,
  },
  separator: '\n',
};

export async function concatGlob(paths: string[] | string, options: ConcatGlobOptions = {}) {
  const mergedOptions = Object.assign({}, defaultConcatGlobOptions, options);
  const resolvedPaths = await globby(paths, mergedOptions.glob);
  const filePromises: Promise<string>[] = [];
  resolvedPaths.forEach((filePath) => {
    filePromises.push(new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }));
  });
  const files = await Promise.all(filePromises);
  return files.join(mergedOptions.separator);
}

export async function concatGlobToFile(paths: string[] | string, outputPath: string, options: ConcatGlobOptions = {}) {
  const concatFiles = await concatGlob(paths, options);
  return await new Promise((resolve, reject) => {
    fs.writeFile(outputPath, concatFiles, { encoding: 'utf8' }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

export default concatGlob;
