import { request } from "./utils";
import * as https from 'https';
import { getRootPath } from "./config";
import * as unzipper from 'unzipper';
import * as fs from 'fs';


export async function installCodeCrafter() {
    const rootPath = getRootPath();

    if (!rootPath) {
        return;
    }

    https.get("https://files.jojojux.de/resources/codecrafter/prgrmr.zip", (stream) => {
        stream.pipe(unzipper.Extract({
            path: `${rootPath}/prgrmr`
        }));
    });
}