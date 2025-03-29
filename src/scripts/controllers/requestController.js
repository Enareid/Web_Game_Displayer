import * as fs from 'fs/promises';
import { getContentTypeFrom }  from './contentTypeUtil.js';

const BASE = 'http://localhost/';

/**
 *  define a controller to retrieve static resources
 */
export default class RequestController {

  #request;
  #response;
  #url;

  constructor(request, response) {
    this.#request = request;
    this.#response = response;
    this.#url = new URL(this.request.url, BASE).pathname; // on ne considère que le "pathname" de l'URL de la requête
  }

  get response() {
    return this.#response;
  }
  get request() {
    return this.#request;
  }
  get url() {
    return this.#url;
  }

  async handleRequest() {
    this.response.setHeader("Content-Type", getContentTypeFrom(this.url));
    await this.buildResponse();
    this.response.end();
  }

  /**
   * Send the requested resource as it is, if it exists, else respond with a 404
   */
  async buildResponse() {
    let filePath = `.${this.url}`;
    if (this.url === '/') {
      filePath = './index.html';
    }
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath);
      this.response.statusCode = 200;
      this.response.write(data);
    }
    catch (err) {
      this.response.statusCode = 404;
      this.response.write('Erreur 404: Page non trouvée');
    }
  }
}
